import 'dart:async';
import 'dart:io';
import 'dart:ui';

import 'package:flutter/material.dart';
import 'package:flutter_background_service/flutter_background_service.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:socket_io_client/socket_io_client.dart' as IO;
import 'package:http/http.dart' as http;
import 'dart:convert';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await initializeService();
  runApp(const MyApp());
}

final FlutterLocalNotificationsPlugin flutterLocalNotificationsPlugin =
    FlutterLocalNotificationsPlugin();

Future<void> initializeService() async {
  final service = FlutterBackgroundService();

  // 1. Setup Local Notifications
  const AndroidNotificationChannel channel = AndroidNotificationChannel(
    'push_notifications_channel',
    'Push Notifications',
    description: 'This channel is used for real-time notifications.',
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
      notificationChannelId: 'push_notifications_channel',
      initialNotificationTitle: 'Push Service Running',
      initialNotificationContent: 'Waiting for notifications...',
      foregroundServiceNotificationId: 888,
    ),
    iosConfiguration: IosConfiguration(),
  );
}

@pragma('vm:entry-point')
void onStart(ServiceInstance service) async {
  DartPluginRegistrant.ensureInitialized();

  final FlutterLocalNotificationsPlugin localNotifications =
      FlutterLocalNotificationsPlugin();

  // IMPORTANT: Background isolate also needs notification initialization
  await localNotifications.initialize(
    settings: const InitializationSettings(
      android: AndroidInitializationSettings('@mipmap/ic_launcher'),
    ),
  );

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

  // Connect to our Node.js server
  final String serverUrl = "http://192.168.100.102:5001";

  IO.Socket socket = IO.io(
    serverUrl,
    IO.OptionBuilder()
        .setTransports([
          'websocket',
          'polling',
        ]) // Polling added for better reliability
        .enableAutoConnect()
        .build(),
  );

  socket.onConnect((_) {
    print('Connected to server');
    if (service is AndroidServiceInstance) {
      service.setForegroundNotificationInfo(
        title: "Push Service",
        content: "Connected to server - listening...",
      );
      service.invoke("socket_id", {"id": socket.id});
    }
  });

  socket.onConnectError((err) {
    print('Connect Error: $err');
    if (service is AndroidServiceInstance) {
      service.setForegroundNotificationInfo(
        title: "Push Service Error",
        content: "Error: $err",
      );
    }
  });

  socket.on('connect_timeout', (_) => print('Connect Timeout'));

  socket.on('push-notification', (data) {
    print('Received notification event: $data');

    // Parse notification content
    String? title;
    String? body;

    // Backend sends: { notification: { title, body }, ... }
    if (data['notification'] != null && data['notification'] is Map) {
      final notification = data['notification'];
      title = notification['title']?.toString();
      body = notification['body']?.toString();
    } else {
      // Fallback if structure is flat
      title = data['title']?.toString();
      body = data['body']?.toString();
    }

    title ??= 'New Message';
    body ??= 'You have a new notification';

    try {
      localNotifications.show(
        id: DateTime.now().millisecond % 100000,
        title: title,
        body: body,
        notificationDetails: const NotificationDetails(
          android: AndroidNotificationDetails(
            'push_notifications_channel',
            'Push Notifications',
            channelDescription: 'Real-time notifications',
            importance: Importance.max,
            priority: Priority.high,
            showWhen: true,
          ),
        ),
      );
      print("Notification shown: $title - $body");
    } catch (e) {
      print("Error showing notification: $e");
    }
  });

  socket.onDisconnect((_) => print('Disconnected from server'));

  // Listen for request from UI to get socket ID
  service.on('get_socket_id').listen((event) {
    if (socket.connected && socket.id != null) {
      service.invoke("socket_id", {"id": socket.id});
    }
  });

  // Keep the service alive
  Timer.periodic(const Duration(seconds: 1), (timer) async {
    if (service is AndroidServiceInstance) {
      if (await service.isForegroundService()) {
        // can update notification content here if needed
      }
    }

    // Check if socket is still connected, if not, try to reconnect
    if (!socket.connected) {
      socket.connect();
    }
  });
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'No-Firebase Push',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.deepPurple),
        useMaterial3: true,
      ),
      home: const MyHomePage(),
    );
  }
}

class MyHomePage extends StatefulWidget {
  const MyHomePage({super.key});

  @override
  State<MyHomePage> createState() => _MyHomePageState();
}

class _MyHomePageState extends State<MyHomePage> {
  String _status = "Idle";
  final TextEditingController _appIdController = TextEditingController();
  final String serverUrl = "http://10.0.2.2:5001"; // Android Emulator

  String? _socketId;

  @override
  void initState() {
    super.initState();
    _requestPermission();

    // Listen for socket ID from background service
    FlutterBackgroundService().on('socket_id').listen((event) {
      if (event != null && event['id'] != null) {
        setState(() {
          _socketId = event['id'];
          _status = "Service Connected. Ready to Register.";
        });
      }
    });

    // Ask for it immediately
    FlutterBackgroundService().invoke("get_socket_id");
  }

  Future<void> _requestPermission() async {
    final flutterLocalNotificationsPlugin = FlutterLocalNotificationsPlugin();
    if (Platform.isAndroid) {
      final AndroidFlutterLocalNotificationsPlugin? androidImplementation =
          flutterLocalNotificationsPlugin
              .resolvePlatformSpecificImplementation<
                AndroidFlutterLocalNotificationsPlugin
              >();
      await androidImplementation?.requestNotificationsPermission();
    }
  }

  Future<void> _registerDevice() async {
    final appId = _appIdController.text.trim();
    if (appId.isEmpty) {
      setState(() => _status = "Please enter App ID");
      return;
    }

    setState(() => _status = "Registering...");

    try {
      // Use real socket ID if available, otherwise fallback (which will likely fail for targeting)
      String pushToken = _socketId ?? "waiting-for-socket-id";

      if (_socketId == null) {
        // Try to get it one last time?
        // For now just warn user in status, but proceed to try
        setState(() => _status = "Warning: No Socket ID yet...");
      }

      final body = {
        "app_id": appId,
        "device_id": "flutter_device_${DateTime.now().millisecondsSinceEpoch}",
        "platform": "android",
        "os_version": "14.0",
        "app_version": "1.0.0",
        "device_model": "Emulator",
        "push_token": pushToken,
      };

      final response = await http.post(
        Uri.parse('$serverUrl/register-device'),
        headers: {"Content-Type": "application/json"},
        body: jsonEncode(body), // Requires import 'dart:convert';
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        setState(() => _status = "Registered! ID: ${data['device_id']}");
      } else {
        setState(() => _status = "Error: ${response.statusCode}");
      }
    } catch (e) {
      setState(() => _status = "Connection Error: $e");
    }
  }

  Future<void> _triggerNotification() async {
    // Keeping this for manual testing if needed, but primary flow is now Registration -> Wait for Push
    setState(() => _status = "Sending Broadcast Trigger...");
    try {
      final response = await http
          .post(
            Uri.parse('$serverUrl/send-notification'),
          ) // This endpoint needs specific args now, might fail if called without valid body
          .timeout(const Duration(seconds: 5));
      // ... handling ...
    } catch (e) {}
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Push Client')),
      body: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: <Widget>[
            const Icon(
              Icons.phonelink_setup,
              size: 60,
              color: Colors.deepPurple,
            ),
            const SizedBox(height: 30),
            TextField(
              controller: _appIdController,
              decoration: const InputDecoration(
                labelText: "Enter App ID from Panel",
                border: OutlineInputBorder(),
                prefixIcon: Icon(Icons.apps),
              ),
            ),
            const SizedBox(height: 20),
            ElevatedButton(
              onPressed: _registerDevice,
              style: ElevatedButton.styleFrom(
                minimumSize: const Size(double.infinity, 50),
              ),
              child: const Text('Register Device'),
            ),
            const SizedBox(height: 30),
            Text(
              'Status: $_status',
              textAlign: TextAlign.center,
              style: const TextStyle(fontWeight: FontWeight.bold),
            ),
            const Spacer(),
            const Text(
              'Keep the app open or in background to receive notifications via Socket.io bridge.',
              textAlign: TextAlign.center,
              style: TextStyle(color: Colors.grey, fontSize: 12),
            ),
          ],
        ),
      ),
    );
  }
}
