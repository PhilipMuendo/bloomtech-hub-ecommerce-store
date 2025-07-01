// src/firebase.ts
// Firebase configuration and initialization
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyB4x4-oHJoVqyQ4Jr9LDgn0uDd95YDlBk8",
  authDomain: "bloomtech-hub.firebaseapp.com",
  projectId: "bloomtech-hub",
  storageBucket: "bloomtech-hub.firebasestorage.app",
  messagingSenderId: "965289531110",
  appId: "1:965289531110:web:e1ec9bcce25595f7738d27",
  measurementId: "G-WEENM9EEEM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export { app, analytics };
