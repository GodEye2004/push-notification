# مستند جامع معماری و نحوه استفاده — Push Notification

این سند مرحله‌به‌مرحله چرخه‌ی کامل برنامه، API‌ها، نحوه‌ی راه‌اندازی محلی و نکات مهم مربوط به FCM و سرویس پس‌زمینه را توضیح می‌دهد. هدف: هر توسعه‌دهنده یا کاربر نهایی باید بتواند سریع سیستم را اجرا، تست و توسعه دهد.

## معماری کلی

- frontend (Admin Panel): `packages/admin-panel` — Next.js (App Router). صفحه داشبورد، ارسال اعلان و مشاهده تاریخچه.
- backend (Server): `packages/server` — Express + Socket.IO + MongoDB. مدیریت اپ‌ها، دیوایس‌ها، ارسال اعلان (Socket.IO + FCM)، ذخیره تاریخچه.
- mobile app: `packages/mobile-app` — Flutter app نمونه که `godeye_push_notification` را استفاده می‌کند.
- push library: `packages/godeye_push_notification` — کتابخانه‌ای که FCM + Socket.IO + background service را برای اپ Flutter مدیریت می‌کند.

## جریان داده (high-level)

1. اپ موبایل روی راه‌اندازی اولیه (`main.dart`) کتابخانه را مقداردهی می‌کند و `PushNotificationService().initialize(...)` را صدا می‌زند.
2. کتابخانه یک device id محلی تولید/ذخیره می‌کند و یک FCM token می‌گیرد.
3. سرویس پس‌زمینه (foreground service روی Android) راه‌اندازی می‌شود و یک Socket.IO به سرور می‌زند.
4. سرور وقتی دستگاه آنلاین است، پیام‌های دریافتی را اول از طریق Socket به room مربوطه می‌فرستد، سپس (اختیاری) FCM را نیز ارسال می‌کند.
5. اگر دستگاه آفلاین بود یا FCM با خطا مواجه شد، سرور رکورد Notification را با وضعیت `pending` ذخیره می‌کند.
6. وقتی دستگاه دوباره متصل شد، سرویس پس‌زمینه از `/pending-notifications/:device_id` درخواست می‌زند و موارد pending را نشان می‌دهد.

## فایل‌ها و نقاط ورود مهم

- `packages/server/src/server.js` — endpoint‌های REST و Socket.IO. مهم‌ترین مسیرها:
  - `GET /api/status` → { status, online_devices, online_count, history }
  - `GET /apps` → لیست اپ‌ها
  - `POST /send-notification` → ارسال اعلان (Socket.IO + FCM + ذخیره در Mongo)
  - `POST /register-device` → ثبت یا به‌روزرسانی device با push_token
  - `GET /pending-notifications/:device_id` → دریافت pending notifications

- `packages/admin-panel/src/app/page.tsx` — داشبورد. توجه: frontend اکنون از `GET /api/status` و `GET /apps` استفاده می‌کند و با mock routes محلی تست‌پذیر است.

- `packages/mobile-app/lib/main.dart` — نمونه‌ی استفاده از کتابخانه:

```dart
WidgetsFlutterBinding.ensureInitialized();
await Firebase.initializeApp();
FirebaseMessaging.onBackgroundMessage(firebaseMessagingBackgroundHandler);
await PushNotificationService().initialize(
  serverUrl: "http://<SERVER>",
  appId: "<APP_ID>",
  deviceModel: "My Phone",
  appVersion: "1.0.0",
);
runApp(MyApp());
```

- `packages/godeye_push_notification/lib/godeye_push_notification.dart` — جزئیات:
  - Top-level background handler: `firebaseMessagingBackgroundHandler` (مهم: باید top-level و با `@pragma('vm:entry-point')` باشد).
  - `PushNotificationService.initialize(...)` — مقداردهی FCM handlers، local notifications و پیکربندی `flutter_background_service`.
  - Background isolate entry: `onStart(ServiceInstance service)` که `set_config` را دریافت می‌کند و سپس `_initSocket(...)` را اجرا می‌کند.
  - `_initSocket` یک Socket.IO client ساخته، socket events را گوش می‌دهد و پیام‌ها را با local notifications نمایش می‌دهد.

## رفتار FCM و زمان‌هایی که اپ kill شده

- Notification payload (یعنی payload که شامل `notification` است): سیستم عامل (Android/iOS) خودکار آن را نمایش می‌دهد حتی اگر اپ terminated باشد.
- Data-only payload: برای پردازش در پس‌زمینه نیاز به background handler دارید. در Flutter این handler باید یک top-level function ثبت‌شده توسط `FirebaseMessaging.onBackgroundMessage(...)` باشد.
- محدودیت‌ها:
  - اگر کاربر اپ را force-quit (از task manager) کند، تحویل data-only در Android ممکن است قطع شود مگر این‌که یک foreground native service (مثل foreground service در Android) داشته باشید.
  - برای اطمینان از دریافت حتی پس از kill کامل، کتابخانه از `flutter_background_service` استفاده می‌کند که یک foreground service (Android) ایجاد می‌کند و Socket را نگه می‌دارد.

## نحوه ثبت و بروزرسانی توکن FCM

- هنگام `initialize`، کتابخانه:
  1. `FirebaseMessaging.instance.getToken()` را می‌گیرد.
  2. توکن را با `POST /update-fcm-token` یا `POST /register-device` به سرور ارسال می‌کند.
  3. روی `onTokenRefresh` گوش می‌دهد و تغییرات را به سرور ارسال می‌کند.

## Admin Panel — نیازمندی‌ها و تست محلی

- مسیرها (Frontend انتظار):
  - `GET ${API_URL}/api/status` — برای نمایش سوکت‌های آنلاین و تاریخچه
  - `GET ${API_URL}/apps` — برای شمارش برنامه‌ها
  - `DELETE ${API_URL}/api/notifications/:id` — حذف تاریخچه
  - `POST ${API_URL}/api/auth/logout` — خروج (اختیاری)

- Mock routes: برای توسعه محلی mockهایی در `packages/admin-panel/src/app/api/*` اضافه شده‌اند. اگر می‌خواهید بدون سرور واقعی تست کنید، کافی است `packages/admin-panel` را اجرا کنید (`npm run dev`) و مطمئن باشید که هیچ instance دیگری از Next dev قفل را نگرفته باشد.

Commands

```bash
# Admin panel (Next.js)
cd packages/admin-panel
npm install
npm run dev

# Server (Express)
cd packages/server
npm install
node src/server.js

# Flutter app (mobile-app) — اجرا روی device/emulator
cd packages/mobile-app
flutter pub get
flutter run
```

## API نمونه — مثال پاسخ‌ها

- `GET /api/status` →
```json
{
  "status": "online",
  "online_devices": ["device_a","device_b"],
  "online_count": 2,
  "history": [{"_id":"h1","title":"...","sent_at":"2026-02-20T..."}, ...]
}
```

- `GET /apps` →
```json
[ {"id":"app_1","app_name":"App Store Pro","device_count":3200}, ... ]
```

## نحوه ارسال اعلان از Admin (مثال)

- Endpoint: `POST /send-notification` (auth required)
- Body (نمونه):
```json
{
  "app_id": "app_1",
  "type": "all", // or 'device'
  "notification": { "title": "Hello", "body": "Test" },
  "data": { "custom": "value" }
}
```

Server behavior: برای هر device هدف تلاش می‌کند ابتدا socket ارسال کند (اگر آنلاین باشد) و سپس FCM. اگر هر دو موفق نبود، رکورد `Notification` با `status: "pending"` ساخته می‌شود.

## نکات توسعه و حفظ امنیت

- احراز هویت: همه endpointهای حساس (send, apps, register-app, delete history) باید middleware احراز هویت (JWT) را داشته باشند. سرور نمونه از `authMiddleware` بهره می‌برد.
- اعتبارسنجی ورودی: هنگام ثبت device یا ارسال notification مقادیر لازم چک شوند (app_id، device_id، title/body برای notification).
- پاک‌سازی توکن‌های نامعتبر: هنگام شکست FCM و خطای token-not-registered سرور توکن را پاک می‌کند.

## تست‌ها و smoke checks

1. اجرای سرور محلی و ساخت یک اپ در DB (`POST /register-app`).
2. اجرای اپ Flutter در شبیه‌ساز و چک کردن اینکه device در `/apps` و `Device` collection ثبت شده است.
3. ارسال یک `POST /send-notification` و بررسی اینکه دستگاه‌ها (socket یا FCM) پیام را دریافت کرده‌اند.
4. قطع اینترنت دستگاه/شبیه‌ساز و ارسال دوباره پیام — بررسی اینکه رکورد pending ساخته می‌شود و بعد از اتصال مجدد توسط `/pending-notifications/:device_id` تحویل داده می‌شود.

## نکات پایانی و بهترین روش‌ها

- برای تجربه‌ی قابل اتکا روی Android: از foreground service برای نگه داشتن کانکشن Socket و دریافت background data استفاده کنید.
- مسیرهایی که مقادیر `timestamp` و `sent_at` برمی‌گردانند را با ISO date (UTC) بفرستید؛ frontend با `new Date(...).toLocaleString()` نمایش می‌دهد.
- برای UI: انیمیشن‌ها با `framer-motion` ساده نگه دارید تا عملکرد حفظ شود. بخش تاریخچه از مدل top-3 + scrollable list استفاده شده تا UX بهتر شود.

---

اگر بخواهی این سند را به یک README در مسیر `packages/godeye_push_notification/README.md` یا `packages/admin-panel/README.md` کپی کنم و مثال‌های `curl` و تصاویر اضافه کنم، همین الآن انجام می‌دم و بعد یک چک‌لیست اجرا (build + run) انجام می‌دم تا مطمئن شوم همه چیز محلی کار می‌کند.
