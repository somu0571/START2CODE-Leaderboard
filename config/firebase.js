const admin = require('firebase-admin');

const privateKey = process.env.FIREBASE_PRIVATE_KEY
  ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
  : undefined;

if (!process.env.FIREBASE_PROJECT_ID) {
  console.warn('FIREBASE_PROJECT_ID not set. Firebase will not initialize.');
}

let db = null;
let auth = null;

try {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: privateKey
    })
  });

  db = admin.firestore();
  auth = admin.auth();

  db.settings({ ignoreUndefinedProperties: true });
} catch (err) {
  console.error('Firebase initialization failed:', err.message);
}

module.exports = { admin, db, auth };
