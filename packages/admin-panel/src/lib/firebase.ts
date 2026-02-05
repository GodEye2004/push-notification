import * as admin from 'firebase-admin';

if (!admin.apps.length) {
    try {
        // Attempt to load from service-account-key.json in project root
        // In production, use environment variables!
        const serviceAccount = require('../../../service-account-key.json');
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
        });
    } catch (error) {
        console.error('Firebase Admin Init Error:', error);
    }
}

export { admin };
