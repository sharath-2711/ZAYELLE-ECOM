import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
// We will replace this with your actual config when you create the Firebase project
const firebaseConfig = {
  apiKey: "AIzaSyD5R167wFp_oTgqNyi7Nzd2ymBoy9Mm3Yw",
  authDomain: "zayelle-c72f2.firebaseapp.com",
  projectId: "zayelle-c72f2",
  storageBucket: "zayelle-c72f2.firebasestorage.app",
  messagingSenderId: "368470101704",
  appId: "1:368470101704:web:791e26a54b007ce273dffd",
  measurementId: "G-664N16DT9N"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
