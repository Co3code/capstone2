import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAeYihuEWVvE6f69E7v7Qx4KD1Fltl64f8",
  authDomain: "aifoundit-app.firebaseapp.com",
  projectId: "aifoundit-app",
  storageBucket: "aifoundit-app.firebasestorage.app",
  messagingSenderId: "335758254477",
  appId: "1:335758254477:web:73e4589eaf3d7a69bc9dc4",
  measurementId: "G-FMG4DLE37C",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
