
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: "reactchat-7c064.firebaseapp.com",
  projectId: "reactchat-7c064",
  storageBucket: "reactchat-7c064.appspot.com",
  messagingSenderId: "324686999075",
  appId: "1:324686999075:web:ea0efb4e666cd72d99cb96"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);