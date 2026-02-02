const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const webPush = require("web-push");
const bodyParser = require("body-parser");
const path = require("path");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

// Web Push setup (keeping it for the demo page)
const publicVapidKey =
  "BFOSCSgV2v4UBBMmaji0CeZ1SR__yfyvG_4a3M5QiRGDAjg6xi0xsMzsVQC9YGRnBx3W9aGsAXy0AHUNb5AJfF4";
const privateVapidKey = "JkkTiW13BOC2PYkFhIf8XJYeaSvBf-RE9zO4DbiI2w4";

webPush.setVapidDetails(
  "mailto:test@test.com",
  publicVapidKey,
  privateVapidKey,
);

let subscriptions = [];
let notificationHistory = [];
let activeClients = new Map();

io.on("connection", (socket) => {
  const clientInfo = {
    id: socket.id,
    connectedAt: new Date(),
    platform: socket.handshake.query.platform || "Unknown",
    ip: socket.handshake.address,
  };

  activeClients.set(socket.id, clientInfo);
  console.log("Client connected:", clientInfo);

  socket.on("disconnect", () => {
    activeClients.delete(socket.id);
    console.log("Client disconnected:", socket.id);
  });
});

// MongoDB Setup
const mongoose = require("mongoose");
const App = require("./models/App");
const Device = require("./models/Device");
const Notification = require("./models/Notification");

mongoose.connect("mongodb://localhost:27017/push-notification")
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.error("MongoDB Connection Error:", err));

const crypto = require("crypto");
const generateUUID = () => crypto.randomUUID();
const generateAPIKey = () => crypto.randomBytes(32).toString("hex");

// --- Endpoints ---

// 0. List Apps
app.get("/apps", async (req, res) => {
  try {
    const apps = await App.find().sort({ created_at: -1 });
    // Aggregation to get device counts could be optimized, but for now loop or separate query
    // Simple way:
    const appList = await Promise.all(apps.map(async (app) => {
      const deviceCount = await Device.countDocuments({ app_id: app.app_id });
      return {
        id: app.app_id,
        app_name: app.app_name,
        package_name: app.package_name,
        api_key: app.api_key,
        created_at: app.created_at,
        device_count: deviceCount
      };
    }));
    res.json(appList);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 0.1 Status
app.get("/api/status", async (req, res) => {
  try {
    const history = await Notification.find().sort({ sent_at: -1 }).limit(50);
    res.json({
      status: "online",
      clients: Array.from(activeClients.values()),
      history: history
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 1. Register App
app.post("/register-app", async (req, res) => {
  const { app_name, package_name } = req.body;

  if (!app_name || !package_name) {
    return res.status(400).json({ error: "app_name and package_name are required" });
  }

  const app_id = generateUUID();
  const api_key = generateAPIKey();

  try {
    const newApp = new App({
      app_id,
      api_key,
      app_name,
      package_name
    });

    await newApp.save();

    console.log(`[Register App] Registered: ${app_name} (${app_id})`);

    res.json({
      app_id,
      api_key,
      status: "registered"
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Register Device
app.post("/register-device", async (req, res) => {
  const { app_id, device_id, platform, os_version, app_version, device_model, push_token } = req.body;

  if (!app_id || !device_id) {
    return res.status(400).json({ error: "app_id and device_id are required" });
  }

  try {
    const app = await App.findOne({ app_id });
    if (!app) {
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
        last_seen: new Date()
      },
      { upsert: true, new: true }
    );

    console.log(`[Register Device] App: ${app_id}, Device: ${device_id}`);

    res.json({
      status: "device_registered",
      device_id
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Send Notification
app.post("/send-notification", async (req, res) => {
  const { app_id, targets, type, value, notification, data, api_key } = req.body;

  try {
    // Authentication
    const app = await App.findOne({ app_id });
    if (!app || app.api_key !== api_key) {
      return res.status(401).json({ error: "Unauthorized: Invalid app_id or api_key" });
    }

    let targetDevices = [];

    // Determine Targets
    if (type === "all") {
      targetDevices = await Device.find({ app_id });
    } else if (type === "device") {
      const device = await Device.findOne({ app_id, device_id: value });
      if (device) {
        targetDevices = [device];
      }
    } else if (type === "tag") {
      console.warn("Tag targeting not fully implemented yet.");
      // If we implement tags later, query here.
    }

    console.log(`[Send Debug] AppID: ${app_id}, DeviceCount: ${targetDevices.length}, Type: ${type}, Value: ${value}`);

    const sentTo = [];
    const payload = {
      notification,
      data,
      sent_at: new Date()
    };

    // Send (Simulation + Socket.io for demo)
    const promises = targetDevices.map(async (devInfo) => {
      const devId = devInfo.device_id;

      // 1. Emit to socket if connected 
      // Need to map device_id to socket.id or just broadcast map if we tracked it in memory map.
      // Since activeClients is still in memory (ephemeral connection), we can't easily map without device sending ID on connect.
      // For this demo, we can iterate activeClients or just rely on the 'platform' check if we had socket.id stored.
      // But activeClients is just the socket info. 
      // If we want real realtime without polling, the client needs to join a room named device_id.
      // For now, let's keep the original logic of trying to interpret push_token as socket id or web push.

      if (devInfo.push_token) {
        if (!devInfo.push_token.startsWith('{') && !devInfo.push_token.startsWith('http')) {
          // Assume socket ID
          io.to(devInfo.push_token).emit("push-notification", payload);
        } else {
          try {
            if (typeof devInfo.push_token === 'object' || (typeof devInfo.push_token === 'string' && devInfo.push_token.startsWith('{'))) {
              const sub = typeof devInfo.push_token === 'string' ? JSON.parse(devInfo.push_token) : devInfo.push_token;
              await webPush.sendNotification(sub, JSON.stringify(payload));
            }
          } catch (e) {
            console.error(`Failed to send web push to ${devId}:`, e.message);
          }
        }
      }

      sentTo.push(devId);
    });

    await Promise.all(promises);

    // Save History
    const newNotification = new Notification({
      app_id,
      notification,
      data,
      targets_count: sentTo.length,
      status: "sent",
      sent_at: new Date()
    });
    await newNotification.save();

    console.log(`[Send Notification] Sent to ${sentTo.length} devices for App: ${app.app_name}`);

    res.json({
      status: "sent",
      sent_to: sentTo
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Trigger New Product (Demo)
app.get("/api/trigger-product", async (req, res) => {
  const APP_ID = "72709c30-fd4c-4ede-a5f8-02d713b67de6"; // Hardcoded for demo convenience
  const API_KEY = "bfe9f2ac91a7f0128aeaf68baf1c34d92c4c9d1c69c715d7aaa0db1e11024416";

  const { product_name } = req.query;
  const name = product_name || "Amazing New Product";

  console.log("Triggering New Product Notification for:", name);

  try {
    // Reuse the send-notification logic by making an internal call or just copying logic.
    // Copying logic for simplicity and speed.

    const targetDevices = await Device.find({ app_id: APP_ID });

    if (targetDevices.length === 0) {
      return res.json({ status: "no_devices", message: "No devices registered for shopping app yet." });
    }

    const payload = {
      notification: {
        title: "New Product Available!",
        body: `Check out our new ${name}. It's in stock now.`
      },
      data: { type: "new_product", product_id: "12345" },
      sent_at: new Date()
    };

    const sentTo = [];
    const promises = targetDevices.map(async (devInfo) => {
      if (devInfo.push_token) {
        if (!devInfo.push_token.startsWith('{') && !devInfo.push_token.startsWith('http')) {
          io.to(devInfo.push_token).emit("push-notification", payload);
        } else {
          try {
            if (typeof devInfo.push_token === 'object' || (typeof devInfo.push_token === 'string' && devInfo.push_token.startsWith('{'))) {
              const sub = typeof devInfo.push_token === 'string' ? JSON.parse(devInfo.push_token) : devInfo.push_token;
              await webPush.sendNotification(sub, JSON.stringify(payload));
            }
          } catch (e) {
            console.error(`Failed to send web push to ${devInfo.device_id}:`, e.message);
          }
        }
      }
      sentTo.push(devInfo.device_id);
    });

    await Promise.all(promises);

    // Save History
    const newNotification = new Notification({
      app_id: APP_ID,
      notification: payload.notification,
      data: payload.data,
      targets_count: sentTo.length,
      status: "sent",
      sent_at: new Date()
    });
    await newNotification.save();

    res.json({
      status: "success",
      message: `Notification sent to ${sentTo.length} devices`,
      product: name
    });

  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

const port = 5001;
server.listen(port, () => console.log(`Server started on port ${port}`));
