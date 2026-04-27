const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Replace standard input appearances with explicit height
code = code.replace(/px-3 py-2\.5/g, 'px-3 h-[42px]');

fs.writeFileSync('src/App.tsx', code);
