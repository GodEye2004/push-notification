const fs = require('fs');
let file = fs.readFileSync('packages/server/src/server.js', 'utf8');
file = file.replace(
  'privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\\\n/g, "\\n"),',
  'privateKey: process.env.FIREBASE_PRIVATE_KEY_B64 ? Buffer.from(process.env.FIREBASE_PRIVATE_KEY_B64, "base64").toString("utf-8") : process.env.FIREBASE_PRIVATE_KEY?.replace(/\\\\n/g, "\\n"),'
);
fs.writeFileSync('packages/server/src/server.js', file);
