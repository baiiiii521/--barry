const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Replace text-sm with text-base for inputs so Safari doesn't zoom
code = code.replace(/text-sm focus:border-brand/g, 'text-base focus:border-brand');

// For inputs that don't have text size explicitly, we'll append text-base if missing
const re = /className="(w-full|flex-1) appearance-none(.*?)"/g;
code = code.replace(re, (match, p1, p2) => {
  let newMatch = match;
  if (!p2.includes('text-')) {
    newMatch = newMatch.replace('focus:border-brand', 'text-base focus:border-brand');
  } else if (!p2.includes('text-base') && !p2.includes('text-xl')) {
    // maybe it has `text-brand` or `text-primary` without a size class
    // actually `text-primary` only gives color! We need `text-base`.
    newMatch = newMatch.replace('focus:border', 'text-base focus:border');
  }
  return newMatch;
});

fs.writeFileSync('src/App.tsx', code);
