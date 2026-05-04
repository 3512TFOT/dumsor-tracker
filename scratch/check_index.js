import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, limit, query, orderBy } from "firebase/firestore";

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

async function checkIndex() {
  try {
    console.log("Checking if timestamp index exists...");
    const q = query(collection(db, "reports"), orderBy("timestamp", "desc"), limit(1));
    const snap = await getDocs(q);
    console.log("Success! Index exists. Count:", snap.docs.length);
    process.exit(0);
  } catch (err) {
    console.error("FAILED:", err.code, err.message);
    process.exit(1);
  }
}

checkIndex();
