import 'dart:async';
import 'dart:io';
import 'dart:ui';

import 'package:flutter/material.dart';
import 'package:flutter_background_service/flutter_background_service.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:socket_io_client/socket_io_client.dart' as IO;
import 'package:http/http.dart' as http;

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

    localNotifications.show(
      id: DateTime.now().millisecond % 100000,
      title: data['title']?.toString() ?? 'Background Alert',
      body: data['body']?.toString() ?? 'Notification received!',
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
  });

  socket.onDisconnect((_) => print('Disconnected from server'));

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
  String _status = "Checking...";

  @override
  void initState() {
    super.initState();
    _requestPermission();
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

  Future<void> _triggerNotification() async {
    setState(() => _status = "Sending...");
    try {
      // Note: If using real device, replace 10.0.2.2 with your computer's IP
      final response = await http
          .post(Uri.parse('http://10.0.2.2:5001/send-notification'))
          .timeout(const Duration(seconds: 5));

      if (response.statusCode == 200) {
        setState(() => _status = "Trigger sent! Check status bar.");
      } else {
        setState(() => _status = "Server Error: ${response.statusCode}");
      }
    } catch (e) {
      setState(() => _status = "Connect Error: $e\n(Check IP address)");
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('No-Firebase Push')),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: <Widget>[
            const Icon(
              Icons.notifications_active,
              size: 80,
              color: Colors.deepPurple,
            ),
            const SizedBox(height: 20),
            Text(
              'Status: $_status',
              style: Theme.of(context).textTheme.headlineSmall,
            ),
            const SizedBox(height: 40),
            ElevatedButton(
              onPressed: _triggerNotification,
              child: const Text('Send Test Notification (Broadcast)'),
            ),
            const Padding(
              padding: EdgeInsets.all(20.0),
              child: Text(
                'Even if you close this app (Swipe away), the background service stays alive and listens for notifications from the server.',
                textAlign: TextAlign.center,
                style: TextStyle(color: Colors.grey),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
