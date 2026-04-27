const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  /md:bottom-auto xl:bottom-4/,
  'md:bottom-4'
);

fs.writeFileSync('src/App.tsx', code);
