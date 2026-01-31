const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const webPush = require('web-push');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  }
});

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Web Push setup (keeping it for the demo page)
const publicVapidKey = 'BFOSCSgV2v4UBBMmaji0CeZ1SR__yfyvG_4a3M5QiRGDAjg6xi0xsMzsVQC9YGRnBx3W9aGsAXy0AHUNb5AJfF4';
const privateVapidKey = 'JkkTiW13BOC2PYkFhIf8XJYeaSvBf-RE9zO4DbiI2w4';

webPush.setVapidDetails(
  'mailto:test@test.com',
  publicVapidKey,
  privateVapidKey
);

let subscriptions = [];
let notificationHistory = [];
let activeClients = new Map();

io.on('connection', (socket) => {
  const clientInfo = {
    id: socket.id,
    connectedAt: new Date(),
    platform: socket.handshake.query.platform || 'Unknown',
    ip: socket.handshake.address
  };

  activeClients.set(socket.id, clientInfo);
  console.log('Client connected:', clientInfo);

  socket.on('disconnect', () => {
    activeClients.delete(socket.id);
    console.log('Client disconnected:', socket.id);
  });
});

app.get('/api/status', (req, res) => {
  res.json({
    clients: Array.from(activeClients.values()),
    history: notificationHistory.slice(-10).reverse()
  });
});

app.post('/subscribe', (req, res) => {
  const subscription = req.body;
  subscriptions.push(subscription);
  res.status(201).json({});
});

app.post('/send-notification', (req, res) => {
  const { title, body, imageUrl } = req.body;
  console.log('--- Incoming Notification Request ---');

  const payload = {
    id: Date.now(),
    title: title || 'Default Title',
    body: body || 'Default Body Content',
    imageUrl: imageUrl || null,
    timestamp: new Date()
  };

  notificationHistory.push(payload);
  if (notificationHistory.length > 100) notificationHistory.shift();

  const webPromises = subscriptions.map(sub =>
    webPush.sendNotification(sub, JSON.stringify(payload))
      .catch(err => console.error('Web Push Error:', err))
  );

  io.emit('push-notification', payload);
  console.log('>>> Emitted to Socket.io:', payload);

  Promise.all(webPromises).then(() => res.json({ success: true, payload }));
});

const port = 5001;
server.listen(port, () => console.log(`Server started on port ${port}`));
