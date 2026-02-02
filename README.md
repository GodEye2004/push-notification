# Custom Push Notification System (No Firebase)

This project is a complete push notification system that operates without relying on external services like Firebase Cloud Messaging (FCM). It leverages **Socket.io** to establish real-time communication between the server and the client.

## Architecture Overview

The project consists of three main components:

1.  **Backend (Node.js + Socket.io)**: The central server responsible for managing connections and dispatching messages.
2.  **Dashboard (Next.js)**: A management panel for monitoring online user status and sending notifications.
3.  **Mobile App (Flutter)**: A mobile application that runs in the background and receives messages.

---

## Data Flow & Connections

### 1. Flutter App <-> Backend
*   **Connection Type**: `Socket.io (WebSocket)`
*   **Mechanism**:
    *   The app utilizes a **Background Service** to maintain a persistent socket connection with the server, even when the app is closed.
    *   Upon connection, the server assigns a unique `socket.id` to the client.
    *   The app retrieves this `socket.id` and sends it to the server as the **Push Token** via the `/register-device` endpoint.
    *   When a notification is sent, the server emits the message specifically to this `socket.id`.

### 2. Dashboard <-> Backend
*   **Connection Type**: `HTTP REST API` + `Socket.io (Client)`
*   **Mechanism**:
    *   **Status Monitoring**: The dashboard fetches the list of connected clients via the new `/api/status` endpoint.
    *   **Sending Messages**: The admin composes a message, and the dashboard sends a POST request to `/send-notification`.

---

## Implemented Changes & Fixes

During the development and debugging process, the following changes were made to stabilize the system:

### Backend (`index.js`)
1.  **Added `/api/status`**: To allow the dashboard to display server online status and the count of active clients.
2.  **Fixed Targeting Logic**:
    *   **Previous Issue**: The server was broadcasting messages globally (to everyone) because the targeting logic was flawed.
    *   **Fix**: Removed `io.emit` (broadcast). Messages are now emitted ONLY to the target device's `socket.id` using `io.to(id).emit`.
3.  **Crash Fix**: Resolved the `ERR_HTTP_HEADERS_SENT` error in the `/apps` endpoint.
4.  **Device Counting**: Added `device_count` to the application list response to helping identifying active apps.

### Flutter App (`main.dart`)
1.  **Real Socket ID Retrieval**:
    *   **Previous Issue**: The app was sending a hardcoded fake string as the token, so the server couldn't target it.
    *   **Fix**: Rewrote the logic to retrieve the real `socket.id` from the background service and usage it for registration.
2.  **Notification Parsing Fix**: Updated the JSON parsing logic to handle the nested structure `{ notification: { title, body } }` sent by the backend.

### Dashboard (`panel`)
1.  **Parameter Fix**: Changed the request parameter name from `targets` to `type` to match the backend's expected schema.
2.  **Device Count Display**: The app selection dropdown now shows the number of active devices per app to prevent sending to empty apps.

---

## How to Run

To run the complete system, execute the following commands in separate terminals:

### 1. Run Backend
```bash
node index.js
# Server runs on port 5001
```

### 2. Run Dashboard
```bash
cd panel
npm run dev
# Dashboard runs at http://localhost:3000
```

### 3. Run Mobile App (Flutter)
```bash
cd client_app
flutter run
# The app installs on your device/emulator
```

---

## Important Testing Notes
*   **Re-registration**: If the backend server (`node index.js`) is restarted, its in-memory storage is cleared. You must open the mobile app and click **Register Device** again.
*   **Sending**: In the Dashboard, ensure you select an App that has a device count greater than 0 (e.g., `MyApp (1 devices)`).
