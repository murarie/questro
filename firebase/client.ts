// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps } from "firebase/app";
import {getAuth} from 'firebase/auth';
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA114q8vwGlkr8a-GKNGq8Y9hB-0A5GHac",
  authDomain: "questro-e4c35.firebaseapp.com",
  projectId: "questro-e4c35",
  storageBucket: "questro-e4c35.firebasestorage.app",
  messagingSenderId: "1035936339783",
  appId: "1:1035936339783:web:234ee347f33fa183831e62",
  measurementId: "G-ZQ64C791LK"
};

// Initialize Firebase
const app = !getApps.length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);