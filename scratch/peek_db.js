
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

async function peekData() {
  try {
    console.log("Peeking at report structure...");
    const q = query(collection(db, "reports"), limit(3));
    const snap = await getDocs(q);
    
    if (snap.empty) {
      console.log("No documents found.");
    } else {
      snap.forEach(doc => {
        console.log(`Document ID: ${doc.id}`);
        console.log("Data:", JSON.stringify(doc.data(), null, 2));
        console.log("---");
      });
    }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

peekData();
