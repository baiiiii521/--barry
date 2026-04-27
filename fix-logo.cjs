const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  /<div className="hidden w-20 h-20 rounded-3xl bg-brand\/10 items-center justify-center mb-3 shadow-xl border border-brand\/20 text-brand text-3xl font-black">\n                 TM\n              <\/div>/,
  '<div className="hidden flex-col items-center justify-center mb-3">\n                 <div className="w-20 h-20 rounded-3xl bg-brand/10 flex items-center justify-center shadow-xl border border-brand/20 text-brand text-3xl font-black mb-1">\n                    TM\n                 </div>\n                 <div className="text-[9px] text-secondary/70">👈 在左侧 public 目录上传 <br/> logo.png 即可替换此图标</div>\n              </div>'
);

fs.writeFileSync('src/App.tsx', code);
