
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

// Fetching config from your firebase.js environment
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

async function getAnalytics() {
  try {
    console.log("Connecting to DumsorTracker Intelligence Platform...");
    const querySnapshot = await getDocs(collection(db, "reports"));
    
    let total = 0;
    let onCount = 0;
    let offCount = 0;
    const regionStats = {};
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      total++;
      if (data.type === 'on') onCount++;
      if (data.type === 'off') offCount++;
      
      const reg = data.region || 'Uncategorized';
      if (!regionStats[reg]) {
        regionStats[reg] = { total: 0, on: 0, off: 0 };
      }
      regionStats[reg].total++;
      if (data.type === 'on') regionStats[reg].on++;
      if (data.type === 'off') regionStats[reg].off++;
    });

    console.log("\n--- OVERALL ANALYTICS ---");
    console.log(`Total Reports Since Beginning: ${total}`);
    console.log(`Global Stability Ratio:        ${total > 0 ? Math.round((onCount/total)*100) : 0}%`);
    
    console.log("\n--- REGIONAL BREAKDOWN ---");
    const sortedRegions = Object.entries(regionStats).sort((a,b) => b[1].total - a[1].total);
    sortedRegions.forEach(([reg, stats]) => {
      const stability = Math.round((stats.on / stats.total) * 100);
      console.log(`${reg.padEnd(15)} | Reports: ${stats.total.toString().padEnd(6)} | Stability: ${stability}%`);
    });
    console.log("-------------------------\n");
    process.exit(0);
  } catch (err) {
    console.error("Error fetching data:", err);
    process.exit(1);
  }
}

getAnalytics();
