const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  /<motion\.span \n                         key=\{earnedToday\}\n                         initial=\{\{ opacity: 0\.8, y: 2 \}\}\n                         animate=\{\{ opacity: 1, y: 0 \}\}\n                         className="text-\[34px\] font-mono font-bold text-brand tracking-tighter leading-none"\n                       >/g,
  '<motion.span \n                         key={earnedToday}\n                         initial={{ opacity: 0.8, y: 2 }}\n                         animate={{ opacity: 1, y: 0 }}\n                         className="text-4xl md:text-5xl font-mono font-bold text-brand tracking-tighter leading-none"\n                       >'
);

code = code.replace(
  /<div className="w-\[140px\] md:w-\[180px\] rounded-3xl bg-card border border-app p-4 flex flex-col items-center justify-between shadow-xl relative overflow-hidden">/g,
  '<div className="w-[140px] md:w-[180px] rounded-[32px] bg-card border-[1.5px] border-app p-4 flex flex-col items-center justify-between shadow-2xl relative overflow-hidden">'
);

code = code.replace(
  /<div className="flex-1 rounded-3xl bg-card border border-app p-4 flex flex-col shadow-xl justify-between">/g,
  '<div className="flex-1 rounded-[32px] bg-gradient-to-b from-card to-card-inner border-[1.5px] border-app p-5 flex flex-col shadow-2xl justify-between relative overflow-hidden">\n                  <div className="absolute top-0 right-0 w-32 h-32 bg-brand/5 blur-3xl rounded-full pointer-events-none" />\n'
);

code = code.replace(
  /<div className="bg-card rounded-2xl p-4 md:p-6 lg:p-8 border border-app flex flex-col shadow-sm relative overflow-hidden">/g,
  '<div className="bg-gradient-to-br from-card to-card-inner rounded-[32px] p-5 md:p-8 border-[1.5px] border-app flex flex-col shadow-xl relative overflow-hidden">'
);

fs.writeFileSync('src/App.tsx', code);
