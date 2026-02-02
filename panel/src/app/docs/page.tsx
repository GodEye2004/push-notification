"use client";

import { useState } from "react";
import { Book, Code, Terminal, Globe, Smartphone, Copy, Check, Server, Key } from "lucide-react";

export default function DocsPage() {
    const [activeTab, setActiveTab] = useState("api");
    const [copied, setCopied] = useState<string | null>(null);

    const copyToClipboard = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopied(id);
        setTimeout(() => setCopied(null), 2000);
    };

    const tabs = [
        { id: "api", name: "REST API Workflow", icon: Server },
        { id: "flutter", name: "Flutter Integration", icon: Smartphone },
        { id: "android", name: "Android Native", icon: Terminal },
    ];

    const snippets = {
        api: `// 1. Register App
curl -X POST http://localhost:5001/register-app \\
  -H "Content-Type: application/json" \\
  -d '{ "app_name": "My App", "package_name": "com.example" }'

// Response: { "app_id": "UUID", "api_key": "KEY", ... }

// 2. Register Device
curl -X POST http://localhost:5001/register-device \\
  -H "Content-Type: application/json" \\
  -d '{
    "app_id": "YOUR_APP_ID",
    "device_id": "UNIQUE_DEVICE_ID",
    "platform": "android",
    "os_version": "14",
    "app_version": "1.0.0",
    "device_model": "Pixel 7",
    "push_token": "FCM_TOKEN"
  }'

// 3. Send Notification
curl -X POST http://localhost:5001/send-notification \\
  -H "Content-Type: application/json" \\
  -d '{
    "app_id": "YOUR_APP_ID",
    "api_key": "YOUR_API_KEY",
    "targets": "all",
    "notification": { "title": "Hello", "body": "World" }
  }'`,
        flutter: `import 'package:http/http.dart' as http;
import 'dart:convert';

Future<void> registerDevice() async {
  final url = Uri.parse('http://YOUR_SERVER_IP:5001/register-device');
  
  // Get these from your device info plugin
  final deviceData = {
    "app_id": "YOUR_APP_ID_FROM_PANEL",
    "device_id": "unique-device-id",
    "platform": "android", // or ios
    "os_version": "14.0",
    "app_version": "1.0.0",
    "device_model": "Pixel 7",
    "push_token": "FCM_TOKEN", // Get from Firebase Messaging
  };

  final response = await http.post(
    url,
    headers: {"Content-Type": "application/json"},
    body: jsonEncode(deviceData),
  );

  if (response.statusCode == 200) {
    print("Device registered!");
  } else {
    print("Error: \${response.body}");
  }
}`,
        android: `// Kotlin / OkHttp
val json = JSONObject().apply {
    put("app_id", "YOUR_APP_ID_FROM_PANEL")
    put("device_id", "unique_id")
    put("platform", "android")
    put("push_token", fcmToken)
    // ... other fields
}

val request = Request.Builder()
    .url("http://YOUR_SERVER_IP:5001/register-device")
    .post(RequestBody.create(MediaType.parse("application/json"), json.toString()))
    .build()

client.newCall(request).execute()`
    };

    return (
        <div className="space-y-8 pb-20">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">Documentation</h1>
                <p className="text-muted-foreground">Master the 3-step process: Register App &rarr; Register Device &rarr; Send Notification.</p>
            </div>

            <div className="flex flex-wrap gap-4 p-1 bg-white/5 rounded-2xl w-fit">
                {tabs.map((t) => (
                    <button
                        key={t.id}
                        onClick={() => setActiveTab(t.id)}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl transition-all font-semibold text-sm ${activeTab === t.id ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-muted-foreground hover:text-white"
                            }`}
                    >
                        <t.icon className="w-4 h-4" />
                        {t.name}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="glass-card p-8 rounded-3xl relative overflow-hidden">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <Code className="w-5 h-5 text-primary" />
                                {activeTab === 'api' ? 'API Workflows' : 'Client Integration'}
                            </h3>
                            <button
                                onClick={() => copyToClipboard(snippets[activeTab as keyof typeof snippets], 'snippet')}
                                className="text-muted-foreground hover:text-white transition-colors"
                            >
                                {copied === 'snippet' ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                            </button>
                        </div>
                        <pre className="bg-[#0a0a0a] p-6 rounded-2xl text-xs sm:text-sm text-blue-400 overflow-x-auto border border-white/5 font-mono leading-relaxed">
                            {snippets[activeTab as keyof typeof snippets]}
                        </pre>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="glass-card p-6 rounded-2xl bg-primary/5 border-primary/20">
                        <h4 className="font-bold text-white mb-2 flex items-center gap-2">
                            <Key className="w-4 h-4" /> Authentication
                        </h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Sending notifications requires both the <code>app_id</code> and <code>api_key</code>. Keep your API Key secret!
                        </p>
                    </div>

                    <div className="glass-card p-6 rounded-2xl space-y-4">
                        <h4 className="font-bold text-white">Steps Overview</h4>
                        <div className="space-y-4 relative before:absolute before:left-2.5 before:top-2 before:h-[80%] before:w-0.5 before:bg-white/10">
                            {[
                                { title: "Register App", desc: "Create an app in the Panel to get Keys." },
                                { title: "Register Device", desc: "Mobile app sends device info + push token to backend." },
                                { title: "Send Push", desc: "Call /send-notification with target audience." }
                            ].map((step, i) => (
                                <div key={i} className="relative z-10 pl-8">
                                    <div className="absolute left-0 top-1 w-5 h-5 rounded-full bg-black border border-primary text-primary flex items-center justify-center text-[10px] font-bold">
                                        {i + 1}
                                    </div>
                                    <h5 className="text-sm font-bold text-white">{step.title}</h5>
                                    <p className="text-xs text-muted-foreground">{step.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
