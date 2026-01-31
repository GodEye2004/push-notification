"use client";

import { useState } from "react";
import { Book, Code, Terminal, Globe, Smartphone, Copy, Check } from "lucide-react";
import { motion } from "framer-motion";

export default function DocsPage() {
    const [activeTab, setActiveTab] = useState("flutter");
    const [copied, setCopied] = useState<string | null>(null);

    const copyToClipboard = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopied(id);
        setTimeout(() => setCopied(null), 2000);
    };

    const platforms = [
        { id: "flutter", name: "Flutter", icon: Smartphone },
        { id: "web", name: "Web / JS", icon: Globe },
        { id: "api", name: "Rest API / CURL", icon: Terminal },
    ];

    const codeSnippets = {
        flutter: `// Add socket_io_client to pubspec.yaml
import 'package:socket_io_client/socket_io_client.dart' as IO;

void connectToServer() {
  IO.Socket socket = IO.io('http://YOUR_SERVER_IP:5001', 
    IO.OptionBuilder()
      .setTransports(['websocket'])
      .setQuery({'platform': 'android'})
      .build()
  );

  socket.on('push-notification', (data) {
    print('Received: \${data["title"]}');
    // Show local notification here
  });
}`,
        web: `// Include Socket.io client
import { io } from "socket.io-client";

const socket = io("http://localhost:5001", {
  query: { platform: "web" }
});

socket.on("push-notification", (data) => {
  console.log("New Notification:", data.title);
  new Notification(data.title, { body: data.body });
});`,
        api: `# Send to all devices via Local Bridge
curl -X POST http://localhost:5001/send-notification \\
     -H "Content-Type: application/json" \\
     -d '{
       "title": "Hello World",
       "body": "This is a test message",
       "imageUrl": "https://example.com/img.jpg"
     }'`
    };

    return (
        <div className="space-y-8 pb-20">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">Developer Documentation</h1>
                <p className="text-muted-foreground">Learn how to integrate our professional push service into any application.</p>
            </div>

            <div className="flex gap-4 p-1 bg-white/5 rounded-2xl w-fit">
                {platforms.map((p) => (
                    <button
                        key={p.id}
                        onClick={() => setActiveTab(p.id)}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl transition-all font-semibold text-sm ${activeTab === p.id ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-muted-foreground hover:text-white"
                            }`}
                    >
                        <p.icon className="w-4 h-4" />
                        {p.name}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="glass-card p-8 rounded-3xl relative overflow-hidden">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <Code className="w-5 h-5 text-primary" /> Integration Snippet
                            </h3>
                            <button
                                onClick={() => copyToClipboard(codeSnippets[activeTab as keyof typeof codeSnippets], 'snippet')}
                                className="text-muted-foreground hover:text-white transition-colors"
                            >
                                {copied === 'snippet' ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                            </button>
                        </div>
                        <pre className="bg-[#0a0a0a] p-6 rounded-2xl text-sm text-blue-400 overflow-x-auto border border-white/5 font-mono leading-relaxed">
                            {codeSnippets[activeTab as keyof typeof codeSnippets]}
                        </pre>
                    </div>

                    <div className="glass-card p-8 rounded-3xl space-y-6">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <Book className="w-5 h-5 text-primary" /> Implementation Guide
                        </h3>

                        <div className="space-y-6 text-muted-foreground">
                            {activeTab === 'flutter' && (
                                <>
                                    <section className="space-y-2">
                                        <h4 className="text-white font-semibold">1. Setup Background Service</h4>
                                        <p>Use `flutter_background_service` to keep the Socket.io connection alive even when the app is closed.</p>
                                    </section>
                                    <section className="space-y-2">
                                        <h4 className="text-white font-semibold">2. Initialize Local Notifications</h4>
                                        <p>When the `push-notification` event is received, use `flutter_local_notifications` to display the alert to the user.</p>
                                    </section>
                                </>
                            )}
                            {activeTab === 'web' && (
                                <>
                                    <section className="space-y-2">
                                        <h4 className="text-white font-semibold">1. Request Permissions</h4>
                                        <p>Browser notifications require explicit user permission via `Notification.requestPermission()`.</p>
                                    </section>
                                    <section className="space-y-2">
                                        <h4 className="text-white font-semibold">2. Service Workers</h4>
                                        <p>For true background notifications on web, integrate with a Service Worker to handle events when the tab is closed.</p>
                                    </section>
                                </>
                            )}
                            {activeTab === 'api' && (
                                <>
                                    <section className="space-y-2">
                                        <h4 className="text-white font-semibold">Endpoint Security</h4>
                                        <p>In production, ensure your `/send-notification` endpoint is protected by an API Key or Bearer Token.</p>
                                    </section>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="glass-card p-6 rounded-2xl bg-primary/5 border-primary/20">
                        <h4 className="font-bold text-white mb-2">Quick Tip</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Always use a persistent background service for mobile apps. Mobile OS will kill idle socket connections to save battery unless declared as a foreground service.
                        </p>
                    </div>

                    <div className="glass-card p-6 rounded-2xl space-y-4">
                        <h4 className="font-bold text-white">Resources</h4>
                        <ul className="space-y-3">
                            {['FCM Documentation', 'Socket.io Official Guide', 'Flutter Notifications Plugin'].map((item) => (
                                <li key={item} className="flex items-center gap-2 text-sm text-primary hover:underline cursor-pointer">
                                    <Globe className="w-4 h-4" /> {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
