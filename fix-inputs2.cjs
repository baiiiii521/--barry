const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(/className="w-full bg-card-inner/g, 'className="w-full appearance-none m-0 bg-card-inner');
code = code.replace(/className="flex-1 bg-card-inner/g, 'className="flex-1 appearance-none m-0 bg-card-inner');

fs.writeFileSync('src/App.tsx', code);
