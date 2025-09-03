import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getFunctions } from "firebase/functions";

const firebaseConfig = {
  apiKey: "AIzaSyCqxqIx4Omb6ctL0l0863hnIi3oIMg3QEA",
  authDomain: "happy-face-5c0f0.firebaseapp.com",
  projectId: "happy-face-5c0f0",
  storageBucket: "happy-face-5c0f0.firebasestorage.app",
  messagingSenderId: "132299043247",
  appId: "1:132299043247:web:2bb97b48728d3086a6bf5a",
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const functions = getFunctions(app);

export { auth, db, storage, functions };
