import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, limit, query } from "firebase/firestore";

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
const db = getFirestore(app);

async function countDocs() {
  try {
    const q = query(collection(db, "reports"), limit(200));
    const snap = await getDocs(q);
    console.log("Total docs found (up to 200):", snap.docs.length);
    if (snap.docs.length > 0) {
      console.log("First doc area:", snap.docs[0].data().area);
      console.log("First doc timestamp:", snap.docs[0].data().timestamp);
    }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

countDocs();
