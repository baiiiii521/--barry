const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Replace h-[42px] with h-[44px] block to force consistent height and rendering on inputs
code = code.replace(/h-\[42px\]/g, 'h-[44px] block box-border placeholder:text-secondary/50');

fs.writeFileSync('src/App.tsx', code);
