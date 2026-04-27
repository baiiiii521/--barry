const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  /<div className="flex flex-col md:flex-row gap-3 md:gap-5">/g,
  '<div className="flex flex-row md:flex-row gap-3 md:gap-5">'
);

// Actually we might need to remove flex-col and just keep flex gap-3 md:gap-5 
code = code.replace(
  /<div className="flex flex-row md:flex-row gap-3 md:gap-5">/g,
  '<div className="flex gap-3 md:gap-5">'
);

fs.writeFileSync('src/App.tsx', code);
