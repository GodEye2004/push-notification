library godeye_push_notification;

import 'dart:async';
import 'dart:convert';
import 'dart:io';
import 'dart:ui';

import 'package:flutter/foundation.dart';
import 'package:flutter_background_service/flutter_background_service.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:socket_io_client/socket_io_client.dart' as IO;
import 'package:http/http.dart' as http;

class PushNotificationService {
  static final PushNotificationService _instance =
      PushNotificationService._internal();
  factory PushNotificationService() => _instance;
  PushNotificationService._internal();

  static const String _channelId = 'push_notifications_channel_v3';
  static const String _channelName = 'Push Notifications';

  String? _serverUrl;
  String? _appId;

  /// Initialize the push notification service.
  /// [serverUrl] is the URL of your Node.js server.
  /// [appId] is the unique identifier for your application.
  Future<void> initialize({
    required String serverUrl,
    required String appId,
  }) async {
    _serverUrl = serverUrl;
    _appId = appId;

    final service = FlutterBackgroundService();
    final flutterLocalNotificationsPlugin = FlutterLocalNotificationsPlugin();

    // 1. Setup Local Notifications
    const AndroidNotificationChannel channel = AndroidNotificationChannel(
      _channelId,
      _channelName,
      description: 'This channel is used for push notifications.',
      importance: Importance.high,
    );

    await flutterLocalNotificationsPlugin
        .resolvePlatformSpecificImplementation<
          AndroidFlutterLocalNotificationsPlugin
        >()
        ?.createNotificationChannel(channel);

    await flutterLocalNotificationsPlugin.initialize(
      settings: const InitializationSettings(
        android: AndroidInitializationSettings('@mipmap/ic_launcher'),
        iOS: DarwinInitializationSettings(),
      ),
    );

    // 2. Configure Background Service
    await service.configure(
      androidConfiguration: AndroidConfiguration(
        onStart: onStart,
        autoStart: true,
        isForegroundMode: true,
        notificationChannelId: _channelId,
        initialNotificationTitle: 'Push Service Running',
        initialNotificationContent: 'Waiting for notifications...',
        foregroundServiceNotificationId: 888,
      ),
      iosConfiguration: IosConfiguration(),
    );

    // Store config for the background isolate
    Timer.periodic(const Duration(seconds: 2), (timer) async {
      if (await service.isRunning()) {
        service.invoke("set_config", {"serverUrl": serverUrl, "appId": appId});
      }
    });

    service.on('config_ack').listen((event) {
      debugPrint("PushNotificationService: Background isolate initialized.");
    });
  }

  /// Listen for socket ID changes. Useful for registration.
  Stream<String?> get onSocketId => FlutterBackgroundService()
      .on('socket_id')
      .map((event) => event?['id'] as String?);

  /// Request the current socket ID from the background service.
  void requestSocketId() {
    FlutterBackgroundService().invoke("get_socket_id");
  }

  /// Register the device with the backend.
  Future<bool> registerDevice({
    required String socketId,
    required String deviceId,
    String? deviceModel,
    String? appVersion,
  }) async {
    if (_serverUrl == null || _appId == null) return false;

    try {
      final body = {
        "app_id": _appId,
        "device_id": deviceId,
        "platform": Platform.isAndroid ? "android" : "ios",
        "os_version": Platform.operatingSystemVersion,
        "app_version": appVersion ?? "1.0.0",
        "device_model": deviceModel ?? "Generic Device",
        "push_token": socketId,
      };

      final response = await http.post(
        Uri.parse('$_serverUrl/register-device'),
        headers: {"Content-Type": "application/json"},
        body: jsonEncode(body),
      );

      return response.statusCode == 200;
    } catch (e) {
      debugPrint("PushNotificationService: Registration Error: $e");
      return false;
    }
  }
}

@pragma('vm:entry-point')
void onStart(ServiceInstance service) async {
  try {
    DartPluginRegistrant.ensureInitialized();
  } catch (e) {
    debugPrint("PushNotificationService: DartPluginRegistrant error: $e");
  }

  final localNotifications = FlutterLocalNotificationsPlugin();

  try {
    await localNotifications.initialize(
      settings: const InitializationSettings(
        android: AndroidInitializationSettings('@mipmap/ic_launcher'),
      ),
    );
  } catch (e) {
    debugPrint("PushNotificationService: LocalNotifications init error: $e");
  }

  String? serverUrl;

  service.on('set_config').listen((event) {
    if (event != null && serverUrl == null) {
      serverUrl = event['serverUrl'];
      service.invoke("config_ack", {});
      _initSocket(service, localNotifications, serverUrl!);
    }
  });

  if (service is AndroidServiceInstance) {
    service.on('setAsForeground').listen((event) {
      service.setAsForegroundService();
    });

    service.on('setAsBackground').listen((event) {
      service.setAsBackgroundService();
    });
  }

  service.on('stopService').listen((event) {
    service.stopSelf();
  });
}

void _initSocket(
  ServiceInstance service,
  FlutterLocalNotificationsPlugin localNotifications,
  String serverUrl,
) {
  IO.Socket socket = IO.io(
    serverUrl,
    IO.OptionBuilder()
        .setTransports(['websocket', 'polling'])
        .enableAutoConnect()
        .build(),
  );

  socket.onConnect((_) {
    if (service is AndroidServiceInstance) {
      service.setForegroundNotificationInfo(
        title: "Push Service",
        content: "Connected to server",
      );
      service.invoke("socket_id", {"id": socket.id});
    }
  });

  socket.on('push-notification', (data) {
    String? title =
        data['notification']?['title'] ?? data['title'] ?? 'New Message';
    String? body =
        data['notification']?['body'] ??
        data['body'] ??
        'You have a new notification';

    final style = BigTextStyleInformation(
      body!,
      htmlFormatBigText: true,
      contentTitle: title,
      htmlFormatContentTitle: true,
    );

    localNotifications.show(
      id: DateTime.now().millisecond % 100000,
      title: title,
      body: body,
      notificationDetails: NotificationDetails(
        android: AndroidNotificationDetails(
          'push_notifications_channel_v3',
          'Push Notifications',
          importance: Importance.max,
          priority: Priority.high,
          styleInformation: style,
        ),
      ),
    );
  });

  service.on('get_socket_id').listen((event) {
    if (socket.connected && socket.id != null) {
      service.invoke("socket_id", {"id": socket.id});
    }
  });

  Timer.periodic(const Duration(seconds: 10), (timer) {
    if (!socket.connected) {
      socket.connect();
    }
  });
}
