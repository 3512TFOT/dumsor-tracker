const fs = require('fs');
const { PDFParse } = require('pdf-parse');

const parser = new PDFParse();
const data = fs.readFileSync('./timetable.pdf');

parser.parse(data).then(function(result) {
  result.pages.forEach((page, i) => {
    console.log(`=== PAGE ${i+1} ===`);
    page.lines.forEach(line => {
      const text = line.words.map(w => w.text).join(' ');
      if (text.trim()) console.log(text);
    });
    console.log();
  });
}).catch(err => {
  console.error('Error:', err.message);
});
