import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCdvm_bvDKGdu7W0e30_JHplDois-zvhEM",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "dumsor-tracker-76ca5.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "dumsor-tracker-76ca5",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "dumsor-tracker-76ca5.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "666330820791",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:666330820791:web:3c926f4caf44ed3a0d9d32",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-NHZMKCXB8E"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
