# Server Package

Push notification server built with Express.js and Socket.IO for real-time communication.

## Features

- RESTful API for push notifications
- Socket.IO for real-time connections
- MongoDB integration for data persistence
- FCM (Firebase Cloud Messaging) support

## Development

```bash
# Install dependencies (from root)
melos bootstrap

# Run development server
npm run dev
```

## Configuration

Place your `service-account-key.json` in the `config/` directory.

## Scripts

- `npm run dev` - Start development server
- `npm start` - Start production server
