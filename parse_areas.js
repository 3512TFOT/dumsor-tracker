const fs = require('fs');
const raw = fs.readFileSync('Raw_Load_Management_Data.txt', 'utf-8');

const regionsMap = new Map();
// Structure: { accra: { id: "accra", name: "Accra", groups: { A: [], B: [], C: [] } } }

function getOrCreateRegion(rawName) {
  const id = rawName.toLowerCase().replace(/[^a-z]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  const name = rawName.split('/').map(n => n.trim().charAt(0).toUpperCase() + n.trim().slice(1).toLowerCase()).join(' / ');
  
  if (!regionsMap.has(id)) {
    regionsMap.set(id, { id, name, groups: { A: [], B: [], C: [] } });
  }
  return id;
}

let currentGroup = null;
let currentRegionId = null;

const lines = raw.split('\n');
for (const line of lines) {
  const t = line.trim();
  if (t.startsWith('[GROUP_A_AREAS]')) currentGroup = 'A';
  else if (t.startsWith('[GROUP_B_AREAS]')) currentGroup = 'B';
  else if (t.startsWith('[GROUP_C_AREAS]')) currentGroup = 'C';
  else if (t.startsWith('REGION:')) {
    const rName = t.replace('REGION:', '').trim();
    currentRegionId = getOrCreateRegion(rName);
  }
  else if (t.startsWith('AREAS:')) {
    const areasStr = t.replace('AREAS:', '').trim();
    // Split by comma, trim, filter empty
    let areas = areasStr.split(',').map(a => a.trim()).filter(a => a.length > 0);
    // Remove "and its environs" or similar if needed, or keep them. Let's keep them.
    // Also remove duplicates just in case
    areas = [...new Set(areas)];
    if (currentGroup && currentRegionId) {
      regionsMap.get(currentRegionId).groups[currentGroup] = areas;
    }
  }
}

const regionsArray = Array.from(regionsMap.values());
const regionsCode = 'export const REGIONS_DATA = ' + JSON.stringify(regionsArray, null, 2) + ';\n';

// Now read data.js, replace REGIONS_DATA
let dataJs = fs.readFileSync('src/data.js', 'utf-8');
const regex = /export const REGIONS_DATA = \[[\s\S]*?\];\n/m;
if (regex.test(dataJs)) {
  dataJs = dataJs.replace(regex, regionsCode);
  fs.writeFileSync('src/data.js', dataJs);
  console.log('Successfully updated src/data.js with', regionsArray.length, 'regions and all areas.');
} else {
  console.log('Regex failed to match REGIONS_DATA in src/data.js');
}

