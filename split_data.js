const fs = require('fs');

let dataJs = fs.readFileSync('src/data.js', 'utf-8');

// The REGIONS_DATA array is huge, and findArea depends on it.
// We will split the file by extracting everything starting from 'export const REGIONS_DATA = '

const splitIndex = dataJs.indexOf('export const REGIONS_DATA =');
const coreData = dataJs.slice(0, splitIndex).trim();
const regionsData = dataJs.slice(splitIndex).trim();

fs.writeFileSync('src/data.js', coreData + '\n');
fs.writeFileSync('src/regions.js', regionsData + '\n');

// Now update Onboarding.jsx to import from regions.js
let onboard = fs.readFileSync('src/components/Onboarding.jsx', 'utf-8');
onboard = onboard.replace("import { REGIONS_DATA, findArea } from '../data';", "import { REGIONS_DATA, findArea } from '../regions';");
fs.writeFileSync('src/components/Onboarding.jsx', onboard);

console.log('Successfully split regions data into src/regions.js');
