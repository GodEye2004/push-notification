# FCM Push Notification System - Monorepo

A comprehensive push notification system built with a monorepo architecture using Melos. This project includes a Node.js backend server, Next.js admin panel, and Flutter mobile application.

## Project Structure

```
fcm-push/
├── packages/
│   ├── server/           # Node.js + Express + Socket.IO backend
│   ├── admin-panel/      # Next.js dashboard for managing notifications
│   └── mobile-app/       # Flutter mobile application
├── melos.yaml            # Melos workspace configuration
├── package.json          # Root workspace package
└── README.md
```

## Quick Start

### Prerequisites

- **Node.js** (v18 or higher)
- **Flutter** (v3.10.4 or higher)
- **Dart SDK** (v3.0.0 or higher)
- **MongoDB** (running locally on port 27017)
- **Melos** (installed globally)

### Initial Setup

1. **Install Melos globally:**
   ```bash
   dart pub global activate melos
   ```

2. **Clone and bootstrap the workspace:**
   ```bash
   cd fcm-push
   melos bootstrap
   ```
   This command will install dependencies for all packages.

## Running the Applications

### Backend Server

Start the push notification server:

```bash
# From root
npm run server:dev

# Or directly
cd packages/server
npm run dev
```

The server will start on `http://localhost:5001`

### Admin Panel

Start the Next.js admin dashboard:

```bash
# From root
npm run panel:dev

# Or directly
cd packages/admin-panel
npm run dev
```

The panel will be available at `http://localhost:3000`

### Mobile App

Run the Flutter mobile application:

```bash
# From root
npm run mobile:run

# Or directly
cd packages/mobile-app
flutter run
```

## 🔧 Available Scripts

### Root Level Commands

```bash
# Bootstrap all packages
npm run bootstrap
# or
melos bootstrap

# Clean all packages
npm run clean
# or
melos clean

# Run server in development mode
npm run server:dev

# Run admin panel in development mode
npm run panel:dev

# Run mobile app
npm run mobile:run
```

### Melos-Specific Commands

```bash
# Server commands
melos run server:dev      # Start server (development)
melos run server:start    # Start server (production)

# Admin panel commands
melos run panel:dev       # Start panel (development)
melos run panel:build     # Build panel for production
melos run panel:start     # Start panel (production)

# Mobile app commands
melos run mobile:get      # Get Flutter dependencies
melos run mobile:run      # Run the app
melos run mobile:build    # Build release APK
```

## Packages

### Server (`@fcm-push/server`)

Backend server handling push notifications with Socket.IO for real-time communication.

**Features:**
- RESTful API for notification management
- Socket.IO for real-time device connections
- MongoDB integration
- Multi-app support with API key authentication

**Key Endpoints:**
- `GET /apps` - List all registered apps
- `POST /register-app` - Register a new application
- `POST /register-device` - Register a device for push notifications
- `POST /send-notification` - Send notifications to devices
- `GET /api/status` - Get server status and connected clients

### Admin Panel (`@fcm-push/admin-panel`)

Next.js dashboard for managing applications and sending push notifications.

**Features:**
- RTL support with Persian (Farsi) localization
- Vazirmatn font integration
- Real-time notification preview
- Application management
- Notification history
- Mobile preview component

### Mobile App (`mobile_app`)

Flutter application that receives push notifications.

**Features:**
- Background service for receiving notifications
- Local notifications display
- Device registration
- Socket.IO integration for real-time updates

## Configuration

### Server Configuration

Edit `packages/server/config/service-account-key.json` with your Firebase service account credentials (if using FCM).

### MongoDB

Ensure MongoDB is running on `mongodb://localhost:27017/push-notification`

## Development

### Adding Dependencies

**For server or admin panel (npm packages):**
```bash
cd packages/server  # or packages/admin-panel
npm install <package-name>
```

**For mobile app (Flutter packages):**
```bash
cd packages/mobile-app
flutter pub add <package-name>
```

### Building for Production

**Server:**
```bash
cd packages/server
npm start
```

**Admin Panel:**
```bash
cd packages/admin-panel
npm run build
npm start
```

**Mobile App:**
```bash
cd packages/mobile-app
flutter build apk --release
```

## License

ISC

## Contributing

This is a monorepo project managed with Melos. When contributing:

1. Always run `melos bootstrap` after pulling changes
2. Test all affected packages
3. Update this README if adding new packages or scripts
