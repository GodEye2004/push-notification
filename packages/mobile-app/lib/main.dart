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
  // Use 10.0.2.2 for Android Emulator, localhost for iOS
  final String serverUrl = Platform.isAndroid
      ? "http://10.0.2.2:5001"
      : "http://localhost:5001";

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
      // Use BigTextStyle for nicer, expanded notifications
      final BigTextStyleInformation bigTextStyleInformation =
          BigTextStyleInformation(
            body,
            htmlFormatBigText: true,
            contentTitle: title,
            htmlFormatContentTitle: true,
            summaryText: 'Shopping Demo',
            htmlFormatSummaryText: true,
          );

      localNotifications.show(
        id: DateTime.now().millisecond % 100000,
        title: title,
        body: body,
        notificationDetails: NotificationDetails(
          android: AndroidNotificationDetails(
            'push_notifications_channel_v3', // Changed ID to force update
            'Shopping Notifications', // Changed Name
            channelDescription: 'Notifications for new products',
            importance: Importance.max,
            priority: Priority.high,
            showWhen: true,
            styleInformation: bigTextStyleInformation,
            category: AndroidNotificationCategory.promo,
            visibility: NotificationVisibility.public,
          ),
        ),
      );
      print("Notification shown [v3]: $title - $body");
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
      title: 'Shopping Demo',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.blue),
        useMaterial3: true,
      ),
      home: const ShoppingHomePage(),
    );
  }
}

class ShoppingHomePage extends StatefulWidget {
  const ShoppingHomePage({super.key});

  @override
  State<ShoppingHomePage> createState() => _ShoppingHomePageState();
}

class _ShoppingHomePageState extends State<ShoppingHomePage> {
  // Hardcoded Credentials
  final String _appId = "72709c30-fd4c-4ede-a5f8-02d713b67de6";
  final String _serverUrl =
      "http://10.0.2.2:5001"; // Use 10.0.2.2 for Android Emulator, localhost for iOS

  String _status = "Initializing...";
  String? _socketId;
  bool _registered = false;

  @override
  void initState() {
    super.initState();
    _setupConnection();
  }

  void _setupConnection() {
    // Listen for socket ID from background service
    FlutterBackgroundService().on('socket_id').listen((event) {
      if (event != null && event['id'] != null) {
        setState(() {
          _socketId = event['id'];
          _status = "Connected. Registering...";
        });
        _registerDevice();
      }
    });

    // Request socket ID incase it's already connected
    FlutterBackgroundService().invoke("get_socket_id");
  }

  Future<void> _registerDevice() async {
    if (_registered) return;

    try {
      final body = {
        "app_id": _appId,
        "device_id":
            "phone_${DateTime.now().millisecondsSinceEpoch}", // Unique ID simulation
        "platform": Platform.isAndroid ? "android" : "ios",
        "os_version": "1.0",
        "app_version": "1.0.0",
        "device_model": "Flutter Demo",
        "push_token": _socketId, // Using socket ID as token for this demo
      };

      final response = await http.post(
        Uri.parse('$_serverUrl/register-device'),
        headers: {"Content-Type": "application/json"},
        body: jsonEncode(body),
      );

      if (response.statusCode == 200) {
        setState(() {
          _registered = true;
          _status = "Ready for Deals!";
        });
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Device Registered for Push Notification!'),
          ),
        );
      } else {
        setState(() => _status = "Registration Failed: ${response.statusCode}");
      }
    } catch (e) {
      setState(() => _status = "Connection Error: $e");
    }
  }

  void _addToCart(String productName) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('$productName added to cart!'),
        duration: const Duration(seconds: 1),
        backgroundColor: Colors.green,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Shopping Demo'),
        backgroundColor: Colors.blueAccent,
        foregroundColor: Colors.white,
      ),
      body: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            color: Colors.grey[200],
            width: double.infinity,
            child: Text(
              _status,
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 12, color: Colors.grey[800]),
            ),
          ),
          Expanded(
            child: ListView(
              padding: const EdgeInsets.all(16),
              children: [
                _buildProductCard(
                  "Wireless Headphones",
                  "High quality sound",
                  Icons.headphones,
                ),
                _buildProductCard(
                  "Smart Watch",
                  "Track your fitness",
                  Icons.watch,
                ),
                _buildProductCard(
                  "Running Shoes",
                  "Comfortable for miles",
                  Icons.directions_run,
                ),
                _buildProductCard(
                  "Backpack",
                  "Carry everything",
                  Icons.backpack,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildProductCard(String name, String desc, IconData icon) {
    return Card(
      elevation: 4,
      margin: const EdgeInsets.only(bottom: 16),
      child: ListTile(
        leading: Icon(icon, size: 40, color: Colors.blue),
        title: Text(name, style: const TextStyle(fontWeight: FontWeight.bold)),
        subtitle: Text(desc),
        trailing: IconButton(
          icon: const Icon(Icons.add_shopping_cart, color: Colors.green),
          onPressed: () => _addToCart(name),
        ),
      ),
    );
  }
}
