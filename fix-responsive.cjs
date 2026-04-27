const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Remove sm: constraints on the main app container and give it a max width
code = code.replace(
  /<div className="w-full h-\[100dvh\] sm:h-\[840px\] sm:max-h-\[90vh\] sm:w-\[390px\] sm:my-6 mx-auto bg-app text-primary font-sans overflow-x-hidden pb-24 border-0 sm:border-\[8px\] border-frame sm:rounded-\[48px\] relative shadow-2xl flex flex-col transition-colors duration-300">/,
  '<div className="w-full min-h-[100dvh] md:max-w-4xl lg:max-w-6xl xl:max-w-[1400px] mx-auto bg-app text-primary font-sans overflow-x-hidden pb-24 md:pb-0 relative flex flex-col transition-colors duration-300 md:shadow-2xl md:my-4 md:rounded-3xl border-x md:border-y border-app duration-500">'
);

// 2. Navigation bar updates
// Adjust the fixed bottom nav to be sticky bottom on mobile, side or top on desktop?
// We will just make it stretch but centered max-w matching the main container, and use a bottom padding so it sits nicely.
code = code.replace(
  /<div className="fixed bottom-0 left-0 right-0 w-full sm:max-w-\[390px\] mx-auto bg-card-inner\/90 backdrop-blur-md border-t border-app py-3 px-6 flex justify-between items-center z-50 sm:rounded-b-\[40px\] sm:mb-4">/,
  '<div className="fixed bottom-0 left-0 right-0 w-full md:max-w-4xl lg:max-w-6xl xl:max-w-[1400px] mx-auto bg-card-inner/90 backdrop-blur-lg border-t md:border border-app py-3 md:py-4 px-6 md:px-24 flex justify-between items-center z-50 md:rounded-b-3xl md:rounded-t-none md:bottom-auto xl:bottom-4 xl:rounded-3xl shadow-2xl md:mb-4 xl:mb-0 transition-all duration-300">'
);

// 3. Flex wrap for side-by-side elements in WORK STATUS
// Let's modify the 390px hardcoded container of Clock:
code = code.replace(
  /w-\[140px\]/g,
  'w-[140px] md:w-[180px]'
);

// And the parent flex gap-3
code = code.replace(
  /<div className="flex gap-3">/g,
  '<div className="flex flex-col md:flex-row gap-3 md:gap-5">'
);

// General layout wrappers for the whole "首页" items:
// We want to turn them into a grid on large screens.
fs.writeFileSync('src/App.tsx', code);
