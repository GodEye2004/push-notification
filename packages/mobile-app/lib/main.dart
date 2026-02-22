import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/material.dart';
import 'package:godeye_push_notification/godeye_push_notification.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp();

  // MUST be registered before runApp — handles FCM when app is terminated
  FirebaseMessaging.onBackgroundMessage(firebaseMessagingBackgroundHandler);

  await PushNotificationService().initialize(
    serverUrl: "http://10.135.86.214:5001",
    appId: "05bfb8b7-5b98-4497-b0e6-ce4d40bce041",
    deviceModel: "Flutter Demo",
    appVersion: "1.0.0",
  );

  runApp(const MyApp());
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
  final PushNotificationService _pushService = PushNotificationService();

  String _status = "Initializing...";
  String? _socketId;

  @override
  void initState() {
    super.initState();
    _setupConnection();
  }

  void _setupConnection() {
    // گوش دادن به تغییرات socketId (وقتی سرویس پس‌زمینه متصل شد)
    _pushService.onSocketId.listen((socketId) {
      if (socketId != null && socketId != _socketId) {
        setState(() {
          _socketId = socketId;
          _status = "Connected and registered!";
        });

        // می‌توانید یک پیام کوتاه نمایش دهید
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Push service ready'),
            duration: Duration(seconds: 1),
          ),
        );
      }
    });

    // درخواست socketId فعلی (اگر از قبل متصل باشد)
    _pushService.requestSocketId();
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
