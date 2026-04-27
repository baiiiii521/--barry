const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const startStr = `<div className="bg-card rounded-2xl p-5 border border-app space-y-5 shadow-lg mb-4">`;
const endStr = `</div>\n           \n           <div className="bg-card rounded-2xl p-5 border border-app space-y-5 shadow-lg">`;
const idx1 = code.indexOf(startStr);
const idx2 = code.indexOf(endStr);
if (idx1 !== -1 && idx2 !== -1) {
  const blockLength = idx2 - idx1 + `</div>\n           \n           `.length;
  const block = code.substring(idx1, idx1 + blockLength);
  code = code.substring(0, idx1) + code.substring(idx1 + blockLength);
  
  const targetStr = `<div className="bg-card rounded-2xl p-5 border border-brand/20 mt-4">`;
  code = code.replace(targetStr, block + '\n           ' + targetStr);
}

fs.writeFileSync('src/App.tsx', code);
