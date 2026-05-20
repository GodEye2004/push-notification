const { Server } = require("socket.io");

const activeClients = new Map();

function initSocket(server) {
  const io = new Server(server, { cors: { origin: "*" } });

  io.on("connection", (socket) => {
    const deviceId =
      socket.handshake.auth?.deviceId || socket.handshake.query?.deviceId;

    if (deviceId) {
      socket.join(`device_${deviceId}`);
      if (!activeClients.has(deviceId)) activeClients.set(deviceId, new Set());
      activeClients.get(deviceId).add(socket.id);
      console.log(`[Socket] Device ${deviceId} connected (${socket.id})`);
    }

    socket.on("disconnect", () => {
      if (!deviceId) return;
      const sockets = activeClients.get(deviceId);
      if (sockets) {
        sockets.delete(socket.id);
        if (sockets.size === 0) activeClients.delete(deviceId);
      }
    });
  });

  return io;
}

function getActiveClients() {
  return activeClients;
}

function emitToDevice(io, deviceId, event, payload) {
  io.to(`device_${deviceId}`).emit(event, payload);
}

module.exports = { initSocket, getActiveClients, emitToDevice };