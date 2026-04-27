const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  /className="flex-1 overflow-y-auto no-scrollbar px-4 py-8 space-y-4 pb-24 absolute inset-0 top-0 bg-card-inner z-40 rounded-\[48px\]"/g,
  'className="flex-1 overflow-y-auto no-scrollbar px-4 md:px-8 py-8 space-y-4 pb-24 absolute inset-0 top-0 bg-card-inner z-40 md:rounded-3xl max-w-4xl mx-auto w-full"'
);

// We should also check the 'data' tab and 'profile' tab wrappers
code = code.replace(
  /activeTab === 'data' && \(/g,
  "activeTab === 'data' && ("
);

// Let's find exactly the wrapper for data
// grep for `<div className="px-4 py-6 overflow-y-auto no-scrollbar flex-1 pb-24">`
code = code.replace(
  /<div className="px-4 py-8 overflow-y-auto no-scrollbar flex-1 pb-24 relative bg-card-inner z-40 rounded-\[48px\] inset-0 absolute">/g,
  '<div className="px-4 md:px-8 py-8 overflow-y-auto no-scrollbar flex-1 pb-24 relative bg-card-inner z-40 md:rounded-3xl inset-0 absolute max-w-4xl mx-auto w-full">'
);

fs.writeFileSync('src/App.tsx', code);
