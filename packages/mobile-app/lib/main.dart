import 'package:flutter/material.dart';
import 'package:godeye_push_notification/godeye_push_notification.dart';

void main() async {
  print("DEBUG: [Main] UI Isolate starting...");
  WidgetsFlutterBinding.ensureInitialized();

  final pushService = PushNotificationService();
  await pushService.initialize(
    serverUrl: "http://10.0.2.2:5001",
    appId: "4bb8012a-4372-453f-893a-9d622408aea3",
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
  bool _registered = false;

  @override
  void initState() {
    super.initState();
    _setupConnection();
  }

  void _setupConnection() {
    _pushService.onSocketId.listen((socketId) {
      if (socketId != null && socketId != _socketId) {
        setState(() {
          _socketId = socketId;
          _status = "Connected. Registering...";
        });
        _registerDevice();
      }
    });

    _pushService.requestSocketId();
  }

  Future<void> _registerDevice() async {
    if (_registered || _socketId == null) return;

    final success = await _pushService.registerDevice(
      socketId: _socketId!,
      deviceId: "phone_${DateTime.now().millisecondsSinceEpoch}",
      deviceModel: "Flutter Demo",
    );

    if (success) {
      if (!mounted) return;
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
      setState(() => _status = "Registration Failed");
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
