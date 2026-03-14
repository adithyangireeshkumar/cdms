import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-analytics.js";

const firebaseConfig = {
  apiKey: "AIzaSyA_hZyfMN7w0Tol-Hq7ZGPzMtquSh7tFy4",
  authDomain: "crime-database-management.firebaseapp.com",
  projectId: "crime-database-management",
  storageBucket: "crime-database-management.firebasestorage.app",
  messagingSenderId: "770270512130",
  appId: "1:770270512130:web:78afffd5c4163cdd20d31b",
  measurementId: "G-FKTCN2KFP9"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const analytics = getAnalytics(app);

export { app, auth, db, analytics };
