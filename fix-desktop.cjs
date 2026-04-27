const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// For the Settings Tab: Prevent it from stretching infinitely on xl
code = code.replace(
  /<div className="bg-card rounded-2xl p-5 border border-app space-y-5 shadow-lg mb-4">/g,
  '<div className="bg-card rounded-2xl p-5 md:p-8 lg:p-10 border border-app space-y-5 shadow-lg max-w-4xl mx-auto mb-4">'
);
code = code.replace(
  /<div className="bg-card rounded-2xl p-5 border border-app space-y-5 shadow-lg mt-4">/g,
  '<div className="bg-card rounded-2xl p-5 md:p-8 lg:p-10 border border-app space-y-5 shadow-lg max-w-4xl mx-auto mt-4">'
);
code = code.replace(
  /<div className="bg-card rounded-2xl p-5 border border-brand\/20 mt-4">/g,
  '<div className="bg-card rounded-2xl p-5 md:p-8 lg:p-10 border border-brand/20 max-w-4xl mx-auto mt-4">'
);
code = code.replace(
  /<div className="px-4 pt-4 pb-20 overflow-y-auto no-scrollbar flex-1">/g,
  '<div className="px-4 md:px-8 lg:px-12 pt-4 md:pt-8 pb-20 overflow-y-auto no-scrollbar flex-1">'
);

// For Home Tab:
code = code.replace(
  /<div className="px-4 md:px-8 pt-6 pb-2 flex flex-col lg:grid lg:grid-cols-12 gap-4 lg:gap-6">/g,
  '<div className="px-4 md:px-8 pt-6 pb-2 flex flex-col xl:grid xl:grid-cols-12 gap-4 lg:gap-6 max-w-5xl mx-auto w-full">'
);
// On xl screen we use grid, so let's give the first elements a wrapper if we could... wait, it's just top-level divs.
// Actually, setting max-w-5xl mx-auto inside the home tab flex container will neatly constrain everything into a comfortable center column!
// Date Card is fine being slightly wider.

// Work Status & Income row
code = code.replace(
  /<div className="px-4 py-2 flex flex-col gap-3">/g,
  '<div className="px-4 md:px-8 py-2 flex flex-col gap-3 md:gap-5 max-w-5xl mx-auto w-full">'
);

// CONVERSION row
code = code.replace(
  /<div className="px-4 py-2 mt-2">/g,
  '<div className="px-4 md:px-8 py-2 mt-2 max-w-5xl mx-auto w-full">'
);

// The PRE-CONFIGURED COUNTDOWNS container uses overflow-x-auto, max-w constraint should apply
// The replace mt-2 will apply generic, let's fix the other ones 
code = code.replace(
  /<div className="px-4 py-2 mb-6">/g,
  '<div className="px-4 md:px-8 py-2 mb-6 max-w-5xl mx-auto w-full">'
);

// Replace default Date card sizes
code = code.replace(
  /<div className="bg-card rounded-2xl p-3 border border-app flex flex-col shadow-sm relative overflow-hidden">/g,
  '<div className="bg-card rounded-2xl p-4 md:p-6 lg:p-8 border border-app flex flex-col shadow-sm relative overflow-hidden">'
);

// Make the nav tabs a bit larger on desktop
code = code.replace(
  /size=\{22\}/g,
  'size={24}'
);


fs.writeFileSync('src/App.tsx', code);
