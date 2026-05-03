import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCdvm_bvDKGdu7W0e30_JHplDois-zvhEM",
  authDomain: "dumsor-tracker-76ca5.firebaseapp.com",
  projectId: "dumsor-tracker-76ca5",
  storageBucket: "dumsor-tracker-76ca5.firebasestorage.app",
  messagingSenderId: "666330820791",
  appId: "1:666330820791:web:3c926f4caf44ed3a0d9d32",
  measurementId: "G-NHZMKCXB8E"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
