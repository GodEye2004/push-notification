const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const admin = require('firebase-admin');
const { Server } = require('socket.io');

const authRoutes = require('./routes/auth');
const statsRoutes = require('./routes/stats');
const usersRoutes = require('./routes/users');
const notificationsRoutes = require('./routes/notifications');
const SocketManager = require('./services/SocketManager');

// tip: prevent committing .env to code
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Firebase Admin SDK directly
try {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: "gen-lang-client-0462704292",
      clientEmail: "fcm-636@gen-lang-client-0462704292.iam.gserviceaccount.com",
      privateKey: "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDZkj0Ykv0rWhs6\nO4FtD0lfxIgDLJS54lXglq0ilvbpm8yLGXHRqQwheD3Ogwudem/6qfu2sUb6fn4M\n...rest_of_key...\n-----END PRIVATE KEY-----\n"
    }),
  });
  console.log('[Firebase] Admin SDK initialized correctly with hardcoded literal.');
} catch (error) {
  console.error('[Firebase] initializeApp failed:', error.message);
  try {
     const pKey = process.env.FIREBASE_PRIVATE_KEY_B64 ? Buffer.from(process.env.FIREBASE_PRIVATE_KEY_B64, "base64").toString("utf-8") : process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
     console.log('Key starts with:', pKey?.substring(0, 27));
     console.log('Key contains newline characters:', pKey?.includes('\n'));
     console.log('Key contains literal slash-n:', pKey?.includes('\\n'));
  } catch(e) {}
}

SocketManager.init(io);

// Routes
app.use('/auth', authRoutes);
app.use('/stats', statsRoutes);
app.use('/users', usersRoutes);
app.use('/notifications', notificationsRoutes);

// Database connection
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/fcm-push';

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('[DB] MongoDB connected');
    server.listen(PORT, () => {
      console.log(`[Server] Running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('[DB] MongoDB connection error:', err);
  });
