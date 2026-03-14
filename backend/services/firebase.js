const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
let config = {
  projectId: process.env.FIREBASE_PROJECT_ID || 'crime-database-management'
};

if (serviceAccountPath && fs.existsSync(serviceAccountPath)) {
  const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
  config.credential = admin.credential.cert(serviceAccount);
}

// Initialize Firebase Admin SDK
admin.initializeApp(config);

const db = admin.firestore();
const auth = admin.auth();

module.exports = { admin, db, auth };
