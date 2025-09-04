import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getFunctions } from "firebase/functions";

const firebaseConfig = {
  apiKey: "AIzaSyAaLjWAdlT-GSSpnOxskgwL9NBHGxa5qTU",
  authDomain: "b-it-admin.firebaseapp.com",
  projectId: "b-it-admin",
  storageBucket: "b-it-admin.firebasestorage.app",
  messagingSenderId: "687677788059",
  appId: "1:687677788059:web:349f7ab38721bfb41bdb3e",
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const functions = getFunctions(app);

export { auth, db, storage, functions };
