"use client";

import React, { useState } from "react";
import { Terminal, Smartphone, Copy, Check, Server, Key } from "lucide-react";

export default function DocsPage() {
  const [activeTab, setActiveTab] = useState("api");
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const tabs = [
    { id: "api", name: "گردش کار REST API", icon: Server },
    { id: "flutter", name: "ادغام در فلاتر", icon: Smartphone },
    { id: "android", name: "اندروید نیتیو", icon: Terminal },
  ];

  const snippets: Record<string, string> = {
    api: `# Register App\ncurl -X POST http://localhost:3000/register-app -H "Content-Type: application/json" -d '{"app_name":"My App","package_name":"com.example"}'\n\n# Register Device\ncurl -X POST http://localhost:3000/register-device -H "Content-Type: application/json" -d '{"app_id":"YOUR_APP_ID","device_id":"UNIQUE_DEVICE_ID","platform":"android","os_version":"14","app_version":"1.0.0","device_model":"Pixel 7","push_token":"FCM_TOKEN"}'\n\n# Send Notification\ncurl -X POST http://localhost:3000/send-notification -H "Content-Type: application/json" -H "Authorization: Bearer YOUR_JWT_TOKEN" -d '{"app_id":"YOUR_APP_ID","api_key":"YOUR_API_KEY","type":"all","notification":{"title":"Hello","body":"World"}}'`,
    flutter: `// pubspec.yaml: add godeye_push_notification from mono-repo\n\ndependencies:\n  godeye_push_notification:\n    git:\n      url: https://github.com/GodEye2004/push-notification.git\n      path: packages/godeye_push_notification\n\n// main.dart example:\nimport 'package:godeye_push_notification/godeye_push_notification.dart';\n\nvoid main() async {\n  WidgetsFlutterBinding.ensureInitialized();\n  await Firebase.initializeApp();\n  FirebaseMessaging.onBackgroundMessage(firebaseMessagingBackgroundHandler);\n  await PushNotificationService().initialize(serverUrl: "http://YOUR_SERVER:5001", appId: "YOUR_APP_ID");\n  runApp(const MyApp());\n}`,
    android: `// Android: register device via HTTP (example)\nval json = JSONObject().apply {\n  put("app_id","YOUR_APP_ID")\n  put("device_id","unique_id")\n  put("platform","android")\n  put("push_token", fcmToken)\n}\n// POST to /register-device with this JSON`
  };

  return (
    <div className="space-y-8 pb-20 px-6">
      <header>
        <h1 className="text-3xl font-bold text-white mb-2">مستندات سیستم Push Notification</h1>
        <p className="text-muted-foreground">راهنمای جامع راه‌اندازی و استفاده از Admin Panel، Server و Mobile App.</p>
      </header>

      <div className="flex flex-wrap gap-4 p-1 bg-white/5 rounded-2xl w-fit">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl transition-all font-semibold text-sm ${activeTab === t.id ? "bg-primary text-white" : "text-muted-foreground"}`}
          >
            <t.icon className="w-4 h-4" />
            {t.name}
          </button>
        ))}
      </div>

      <main className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
        <section className="lg:col-span-2 space-y-6">
          <div className="glass-card p-8 rounded-3xl">
            <h3 className="text-lg font-bold text-white mb-4">{activeTab === 'api' ? 'جریان‌های کاری API' : 'ادغام سمت کلاینت'}</h3>
            <div className="relative">
              <button onClick={() => copyToClipboard(snippets[activeTab], 'snippet')} className="absolute left-4 top-0 text-muted-foreground">{copied === 'snippet' ? <Check /> : <Copy />}</button>
              <pre className="bg-[#0a0a0a] p-6 rounded-2xl text-xs sm:text-sm text-blue-400 overflow-x-auto font-mono" dir="ltr">{snippets[activeTab]}</pre>
            </div>
          </div>

          <div className="glass-card p-6 rounded-2xl">
            <h4 className="font-bold text-white">نکات فنی</h4>
            <ul className="text-sm text-muted-foreground mt-3 list-disc pl-5">
              <li>برای background FCM یک تابع top-level با pragma(&#39;vm:entry-point&#39;) تعریف و در main قبل از runApp ثبت کنید.</li>
              <li>کتابخانه Flutter ما `flutter_background_service` را برای نگهداری Socket در پس‌زمینه (Android foreground service) استفاده می‌کند.</li>
              <li>سرور فایل‌های pending را در `/pending-notifications/:device_id` ارائه می‌دهد؛ پس از اتصال سرویس آنها نمایش داده می‌شوند.</li>
            </ul>
          </div>
        </section>

        <aside className="space-y-6">
          <div className="glass-card p-6 rounded-2xl bg-primary/5">
            <h4 className="font-bold text-white mb-2 flex items-center gap-2"><Key className="w-4 h-4"/> احراز هویت</h4>
            <p className="text-sm text-muted-foreground">برای عملیات حساس (ارسال، حذف) از JWT استفاده شود. کلیدهای API را محرمانه نگه دارید.</p>
          </div>

          <div className="glass-card p-6 rounded-2xl">
            <h4 className="font-bold text-white">نحوه اجرا</h4>
            <p className="text-sm text-muted-foreground">در ریشه هر پکیج دستورات نصب و اجرا را اجرا کنید (npm install / flutter pub get / node src/server.js).</p>
          </div>
        </aside>
      </main>

      <section style={{ marginTop: 18 }}>
        <h2>Admin Panel — راهنمای کاربری سریع</h2>
        <ol>
          <li>در داشبورد تعداد برنامه‌ها، سوکت‌های فعال و تاریخچه ارسال‌ها را می‌بینید.</li>
          <li>برای حذف یک ورودی تاریخچه روی دکمه حذف کلیک کنید (عملیات optimistic — فورا از UI حذف می‌شود و در صورت خطا بازگردانده می‌شود).</li>
          <li>سه آیتم اول تاریخچه همیشه نمایش داده می‌شوند؛ بقیه در یک باکس قابل اسکرول قرار دارند.</li>
          <li>برای قطع اتصال یک سوکت (در صفحه Active Sockets) از دکمه Disconnect استفاده کنید — این درخواست به سرور ارسال می‌شود.</li>
        </ol>
      </section>

      <section style={{ marginTop: 18, marginBottom: 30 }}>
        <h2>مثال‌های curl برای توسعه و تست</h2>
        <pre style={{ background: 'rgba(0,0,0,0.25)', padding: 12, borderRadius: 8 }}>{`# status
curl -H "Authorization: Bearer <TOKEN>" http://localhost:5001/api/status

# list apps
curl -H "Authorization: Bearer <TOKEN>" http://localhost:5001/apps

# send notification
curl -X POST -H "Authorization: Bearer <TOKEN>" -H "Content-Type: application/json" \
  -d '{"app_id":"app_1","type":"all","notification":{"title":"Hi","body":"Hello"}}' \
  http://localhost:5001/send-notification`}</pre>
      </section>

      <footer style={{ marginTop: 24, color: '#9fbbe8' }}>
        اگر بخواهید این صفحه را ویرایش کنم یا بخش خاصی را تصویری کنم (اسکرین‌شات‌ها، GIF) بگو تا اضافه کنم.
      </footer>
    </div>
  );
}
