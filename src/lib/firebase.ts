
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB4x4-oHJoVqyQ4Jr9LDgn0uDd95YDlBk8",
  authDomain: "bloomtech-hub.firebaseapp.com",
  projectId: "bloomtech-hub",
  storageBucket: "bloomtech-hub.firebasestorage.app",
  messagingSenderId: "965289531110",
  appId: "1:965289531110:web:e82c2502da8860ff738d27",
  measurementId: "G-0YETS3Z874"
};

const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);
