const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  /<div className="flex-1 overflow-y-auto no-scrollbar px-4 py-6 space-y-4 pb-24">/g,
  '<div className="flex-1 overflow-y-auto no-scrollbar px-4 md:px-8 py-6 space-y-4 pb-24 max-w-5xl mx-auto w-full">'
);

fs.writeFileSync('src/App.tsx', code);
