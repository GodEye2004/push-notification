const admin = require("firebase-admin");

const key = process.env.FIREBASE_PRIVATE_KEY_B64
  ? Buffer.from(process.env.FIREBASE_PRIVATE_KEY_B64, "base64").toString("utf-8")
  : "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDZkj0Ykv0rWhs6\nO4FtD0lfxIgDLJS54lXglq0ilvbpm8yLGXHRqQwheD3Ogwudem/6qfu2sUb6fn4M\n...rest_of_key...\n-----END PRIVATE KEY-----\n";

console.log("Raw Key:\\n" + key);

try {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: "gen-lang-client-0462704292",
      clientEmail: "fcm-636@gen-lang-client-0462704292.iam.gserviceaccount.com",
      privateKey: key
    }),
  });
  console.log('Firebase initialized successfully!');
} catch (e) {
  console.error("Failed:", e.message);
}
