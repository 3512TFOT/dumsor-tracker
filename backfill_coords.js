import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, updateDoc, doc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCdvm_bvDKGdu7W0e30_JHplDois-zvhEM",
  authDomain: "dumsor-tracker-76ca5.firebaseapp.com",
  projectId: "dumsor-tracker-76ca5",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function backfill() {
  console.log("Starting backfill for old reports...");
  const snapshot = await getDocs(collection(db, 'reports'));
  let updated = 0;
  
  for (const r of snapshot.docs) {
    const data = r.data();
    if (data.lat || data.area === 'Detected Location' || data.area === 'Unknown') continue;
    
    await new Promise(res => setTimeout(res, 1000));
    
    try {
      let searchArea = data.area.replace('Part of ', '').replace(' township', '').replace(' and its environs', '');
      const query = encodeURIComponent(`${searchArea}, Ghana`);
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}`, {
        headers: {
            'User-Agent': 'DumsorTracker/1.0 (internal maintenance script)'
        }
      });
      const json = await res.json();
      
      if (json && json.length > 0) {
        const lat = parseFloat(json[0].lat);
        const lng = parseFloat(json[0].lon);
        if (lat > 4 && lat < 12 && lng > -4 && lng < 2) {
            await updateDoc(doc(db, 'reports', r.id), { lat, lng });
            console.log(`Updated ${data.area} -> ${lat}, ${lng}`);
            updated++;
        }
      } else {
        console.log(`Coordinates not found for: ${data.area}`);
      }
    } catch(e) {
      console.log(`Error on ${data.area}:`, e.message);
    }
  }
  console.log(`Finished. Successfully added coordinates to ${updated} historical reports.`);
  process.exit(0);
}

backfill();
