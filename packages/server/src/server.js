const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const bodyParser = require("body-parser");
const path = require("path");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const mongoose = require("mongoose");
const admin = require("firebase-admin");

// Load environment variables from the correct path
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});

// ─── Firebase Admin SDK ─────────────────────────────────────────────────────
try {
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;
  if (!privateKey) {
    throw new Error(
      "FIREBASE_PRIVATE_KEY is missing from environment variables.",
    );
  }
  // If the key contains literal backslash-n (from a single-line .env), convert them to real newlines
  privateKey = privateKey.replace(/\\n/g, "\n");

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: privateKey,
    }),
  });

  console.log(
    "[Firebase] Admin SDK initialized correctly using environment variables.",
  );
} catch (error) {
  console.error("[Firebase] initializeApp failed:", error.message);
  if (process.env.FIREBASE_PRIVATE_KEY) {
    console.log(
      "Key starts with:",
      process.env.FIREBASE_PRIVATE_KEY.substring(0, 20),
    );
  }
  // Depending on your deployment strategy, you might want to exit here
  // process.exit(1);
}

// ─── Debug: log key info (optional, remove in production) ─────────────────
console.log(
  "Key starts with:",
  process.env.FIREBASE_PRIVATE_KEY?.substring(0, 30),
);
console.log(
  "Key contains newline characters:",
  process.env.FIREBASE_PRIVATE_KEY?.includes("\n"),
);
console.log(
  "Key contains literal slash-n:",
  process.env.FIREBASE_PRIVATE_KEY?.includes("\\n"),
);

app.use(cors());
app.use(bodyParser.json());

// ─── In-memory state ────────────────────────────────────────────────────────
// deviceId → Set of socketIds (a device can have multiple tabs/connections)
const activeClients = new Map();

// ─── Socket.IO ──────────────────────────────────────────────────────────────
io.on("connection", (socket) => {
  const deviceId = socket.handshake.auth?.deviceId;

  if (deviceId) {
    // Join a stable room named after the device
    socket.join(`device_${deviceId}`);

    if (!activeClients.has(deviceId)) {
      activeClients.set(deviceId, new Set());
    }
    activeClients.get(deviceId).add(socket.id);

    console.log(
      `[Socket] Device ${deviceId} connected via socket ${socket.id}`,
    );
  } else {
    console.warn(`[Socket] Client connected WITHOUT device id: ${socket.id}`);
  }

  socket.on("disconnect", () => {
    if (deviceId) {
      const sockets = activeClients.get(deviceId);
      if (sockets) {
        sockets.delete(socket.id);
        if (sockets.size === 0) activeClients.delete(deviceId);
      }
      console.log(`[Socket] Device ${deviceId} disconnected (${socket.id})`);
    }
  });
});

// ─── MongoDB Models ────────────────────────────────────────────────────────
const App = require("./models/App");
const Device = require("./models/Device");
const Notification = require("./models/Notification");
const User = require("./models/User");
const OTP = require("./models/OTP");
const kavenegarService = require("./utils/kavenegar");

const connectDB = async () => {
  try {
    await mongoose.connect(
      process.env.MONGO_URI ||
        process.env.MONGODB_URI ||
        "mongodb://localhost:27017/push-notification",
    );
    console.log("[DB] MongoDB connected");
  } catch (err) {
    console.error("[DB] Connection error:", err.message);
    process.exit(1);
  }
};
connectDB();

const generateUUID = () => crypto.randomUUID();
const generateAPIKey = () => crypto.randomBytes(32).toString("hex");

// ─── Middleware ─────────────────────────────────────────────────────────────
const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token)
    return res.status(401).json({ error: "Access denied. No token provided." });

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "supersecret123",
    );
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token." });
  }
};

// ─── Auth Routes ────────────────────────────────────────────────────────────
app.post("/auth/send-otp", async (req, res) => {
  const { phone } = req.body;
  if (!phone)
    return res.status(400).json({ error: "Phone number is required." });

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 5 * 60000);

  try {
    await OTP.findOneAndUpdate(
      { phone },
      { code, expires_at: expiresAt },
      { upsert: true },
    );
    await kavenegarService.sendOTP(phone, code);
    res.json({ message: "OTP sent successfully." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/auth/verify-otp", async (req, res) => {
  const { phone, code } = req.body;
  if (!phone || !code)
    return res.status(400).json({ error: "Phone and code are required." });

  try {
    const otpDoc = await OTP.findOne({ phone, code });
    if (!otpDoc)
      return res.status(400).json({ error: "Invalid or expired OTP." });

    await OTP.deleteOne({ _id: otpDoc._id });

    let user = await User.findOne({ phone });
    if (!user) {
      user = new User({ phone });
      await user.save();
    }

    const token = jwt.sign(
      { id: user._id, phone: user.phone, role: user.role },
      process.env.JWT_SECRET || "supersecret123",
      { expiresIn: "7d" },
    );

    res.json({ token, user: { phone: user.phone, role: user.role } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/auth/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found." });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── App Routes ─────────────────────────────────────────────────────────────
app.get("/apps", authMiddleware, async (req, res) => {
  try {
    const apps = await App.find().sort({ created_at: -1 });
    const appList = await Promise.all(
      apps.map(async (a) => {
        const deviceCount = await Device.countDocuments({ app_id: a.app_id });
        return {
          id: a.app_id,
          app_name: a.app_name,
          package_name: a.package_name,
          api_key: a.api_key,
          created_at: a.created_at,
          device_count: deviceCount,
        };
      }),
    );
    res.json(appList);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/status", async (req, res) => {
  try {
    const history = await Notification.find().sort({ sent_at: -1 }).limit(50);
    res.json({
      status: "online",
      online_devices: Array.from(activeClients.keys()),
      online_count: activeClients.size,
      history,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/register-app", authMiddleware, async (req, res) => {
  const { app_name, package_name } = req.body;
  if (!app_name || !package_name) {
    return res
      .status(400)
      .json({ error: "app_name and package_name are required" });
  }

  const app_id = generateUUID();
  const api_key = generateAPIKey();

  try {
    const newApp = new App({ app_id, api_key, app_name, package_name });
    await newApp.save();
    console.log(`[App] Registered: ${app_name} (${app_id})`);
    res.json({ app_id, api_key, status: "registered" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Device Routes ──────────────────────────────────────────────────────────
app.post("/register-device", async (req, res) => {
  const {
    app_id,
    device_id,
    platform,
    os_version,
    app_version,
    device_model,
    push_token,
  } = req.body;

  if (!app_id || !device_id) {
    return res.status(400).json({ error: "app_id and device_id are required" });
  }

  try {
    const foundApp = await App.findOne({ app_id });
    if (!foundApp) {
      return res.status(404).json({ error: "App not found" });
    }

    await Device.findOneAndUpdate(
      { app_id, device_id },
      {
        platform,
        os_version,
        app_version,
        device_model,
        push_token,
        last_seen: new Date(),
      },
      { upsert: true, new: true },
    );

    console.log(
      `[Device] Registered: app=${app_id} device=${device_id} fcm=${push_token ? "yes" : "no"}`,
    );
    res.json({ status: "device_registered", device_id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update FCM token independently (called when token refreshes)
app.post("/update-fcm-token", async (req, res) => {
  const { app_id, device_id, push_token } = req.body;
  if (!app_id || !device_id || !push_token) {
    return res
      .status(400)
      .json({ error: "app_id, device_id and push_token required" });
  }
  try {
    await Device.findOneAndUpdate(
      { app_id, device_id },
      { push_token, last_seen: new Date() },
    );
    res.json({ status: "token_updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Send Notification ──────────────────────────────────────────────────────
app.post("/send-notification", authMiddleware, async (req, res) => {
  const { app_id, type, value, notification, data } = req.body;

  if (!app_id || !notification?.title || !notification?.body) {
    return res.status(400).json({
      error: "app_id, notification.title and notification.body are required",
    });
  }

  try {
    const foundApp = await App.findOne({ app_id });
    if (!foundApp) return res.status(404).json({ error: "App not found" });

    let targetDevices = [];
    if (type === "all") {
      targetDevices = await Device.find({ app_id });
    } else if (type === "device") {
      const device = await Device.findOne({ app_id, device_id: value });
      if (device) targetDevices = [device];
    }

    if (targetDevices.length === 0) {
      return res.json({
        status: "queued",
        socket_sent: [],
        fcm_sent: [],
        pending: [],
      });
    }

    const socketSent = [];
    const fcmSent = [];
    const pending = [];

    const payload = { notification, data, sent_at: new Date() };

    for (const devInfo of targetDevices) {
      const devId = devInfo.device_id;
      const isOnline = activeClients.has(devId);
      const fcmToken = devInfo.push_token;

      // 1. Send via Socket.IO if device is online
      if (isOnline) {
        io.to(`device_${devId}`).emit("push-notification", payload);
        socketSent.push(devId);
        console.log(`[Send] Socket → ${devId}`);
        // Also send FCM for reliability (ensures delivery even if socket drops mid-send)
        // Comment out the line below if you want socket-only when online:
        // continue;
      }

      // 2. Send via FCM (background delivery)
      if (fcmToken) {
        try {
          const fcmMessage = {
            notification: {
              title: notification.title,
              body: notification.body,
            },
            android: {
              notification: {
                channelId: "push_notifications_channel_v3",
                priority: "high",
                ...(notification.image ? { imageUrl: notification.image } : {}),
              },
              priority: "high",
            },
            apns: {
              payload: {
                aps: {
                  alert: { title: notification.title, body: notification.body },
                  sound: "default",
                  badge: 1,
                },
              },
            },
            data: data
              ? {
                  ...Object.fromEntries(
                    Object.entries(data).map(([k, v]) => [k, String(v)]),
                  ),
                  sent_at: new Date().toISOString(),
                }
              : { sent_at: new Date().toISOString() },
            token: fcmToken,
          };

          await admin.messaging().send(fcmMessage);
          fcmSent.push(devId);
          console.log(`[Send] FCM → ${devId}`);
        } catch (fcmError) {
          console.error(`[Send] FCM failed for ${devId}:`, fcmError.message);

          // Invalid token → clean up
          if (
            fcmError.code === "messaging/registration-token-not-registered" ||
            fcmError.code === "messaging/invalid-registration-token"
          ) {
            await Device.updateOne(
              { device_id: devId },
              { $unset: { push_token: 1 } },
            );
          } else if (!isOnline) {
            // Save as pending only if not delivered via socket either
            await Notification.create({
              app_id,
              notification,
              data,
              device_id: devId,
              targets_count: 1,
              status: "pending",
              sent_at: new Date(),
            });
            pending.push(devId);
          }
        }
      } else if (!isOnline) {
        // 3. No socket, no FCM → save as pending for next app open
        await Notification.create({
          app_id,
          notification,
          data,
          device_id: devId,
          targets_count: 1,
          status: "pending",
          sent_at: new Date(),
        });
        pending.push(devId);
        console.log(`[Send] Pending → ${devId}`);
      }
    }

    // Save history record
    await Notification.create({
      app_id,
      notification,
      data,
      targets_count: targetDevices.length,
      status: "sent",
      sent_at: new Date(),
    });

    res.json({
      status: "queued",
      socket_sent: socketSent,
      fcm_sent: fcmSent,
      pending,
      total: targetDevices.length,
    });
  } catch (err) {
    console.error("[Send] Error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ─── Pending Notifications ──────────────────────────────────────────────────
app.get("/pending-notifications/:device_id", async (req, res) => {
  const { device_id } = req.params;
  try {
    const pending = await Notification.find({
      device_id,
      status: "pending",
    }).sort({ sent_at: 1 });

    res.json(pending);

    // Mark as delivered
    if (pending.length > 0) {
      await Notification.updateMany(
        { device_id, status: "pending" },
        { $set: { status: "delivered" } },
      );
      console.log(
        `[Pending] Delivered ${pending.length} pending notifications to ${device_id}`,
      );
    }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ─── Start Server ───────────────────────────────────────────────────────────
const port = process.env.PORT || 5001;
server.listen(port, () => console.log(`[Server] Running on port ${port}`));
