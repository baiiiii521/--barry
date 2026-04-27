const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const replacements = [
  { search: /bg-\[#0a0c10\]/g, replace: 'bg-[#0d0d0d]' },
  { search: /text-\[#e5e7eb\]/g, replace: 'text-gray-200' },
  { search: /border-\[#1f2229\]/g, replace: 'border-[#1a1a1a]' },
  { search: /bg-\[#171921\]/g, replace: 'bg-[#141414]' },
  { search: /bg-\[#131720\]/g, replace: 'bg-[#141414]' },
  { search: /bg-\[#1a1f2b\]/g, replace: 'bg-[#141414]' },
  { search: /bg-\[#0d1015\]\/90/g, replace: 'bg-[#0d0d0d]/90' },
  { search: /bg-gradient-to-b from-\[#131720\] to-\[#0d1015\]/g, replace: 'bg-[#141414]' },
  { search: /text-green-400/g, replace: 'text-[#00FF41]' },
  { search: /text-green-500/g, replace: 'text-[#00FF41]' },
  { search: /bg-green-500\/10/g, replace: 'bg-[#00FF41]/10' },
  { search: /bg-green-400/g, replace: 'bg-[#00FF41]' },
  { search: /border-green-400\/30/g, replace: 'border-[#00FF41]/30' },
  { search: /border-green-500\/20/g, replace: 'border-[#00FF41]/20' },
  { search: /text-red-400/g, replace: 'text-[#FF3131]' },
  { search: /text-red-500/g, replace: 'text-[#FF3131]' },
  { search: /bg-red-500\/10/g, replace: 'bg-[#FF3131]/10' },
  { search: /bg-red-500\/20/g, replace: 'bg-[#FF3131]/20' },
  { search: /border-red-500\/20/g, replace: 'border-[#FF3131]/20' },
  { search: /border-red-500\/50/g, replace: 'border-[#FF3131]/50' },
  { search: /text-green-100\/60/g, replace: 'text-black/60' },
  { search: /text-white font-medium text-\[15px\]/g, replace: 'text-xs' },
  { search: /w-40 h-40 bg-green-500\/10 blur-3xl/g, replace: 'w-40 h-40 bg-[#00FF41]/10 blur-[60px]' },
  
  // Specific button styles for Artistic Flair
  { 
    search: /className="mt-6 w-full py-2.5 rounded-full bg-gradient-to-r from-green-500\/80 to-emerald-500\/80 flex flex-col items-center justify-center shadow-\[0_0_20px_rgba\(34,197,94,0.3\)\] border border-green-400\/30"/g, 
    replace: 'className={`mt-6 w-full py-4 rounded-2xl flex flex-col items-center justify-center transition-colors font-black uppercase tracking-tighter ${isWorking ? "bg-white hover:bg-gray-200 text-black" : "bg-[#00FF41] hover:bg-[#00cc33] text-black"}`}' 
  },
  {
    search: /\{isWorking \? '下班打卡' : '上班打卡'\}/g,
    replace: '{isWorking ? "End Work (下班)" : "Start Work (上班)"}'
  },
  {
    search: /<span className="text-black\/60 text-\[10px\]">\{isWorking \? '结束今日工作' : '开启牛马新一天'\}<\/span>/g,
    replace: ''
  },
  
  // Outer container adjust for theme
  {
    search: /className="max-w-\[420px\] mx-auto min-h-screen bg-\[#0d0d0d\] text-gray-200 font-sans overflow-x-hidden pb-24 border-x border-\[#1a1a1a\] relative shadow-2xl"/g,
    replace: 'className="w-[375px] mx-auto min-h-[720px] my-6 bg-[#0d0d0d] text-gray-200 font-sans overflow-x-hidden pb-24 border-[8px] border-[#1a1a1a] rounded-[48px] relative shadow-2xl flex flex-col"'
  },
  
  // Slacking Cost button
  {
    search: /className={`z-10 ml-2 px-3 py-1.5 text-\[11px\] rounded-full border flex items-center gap-1 transition-colors \$\{/g,
    replace: 'className={`z-10 ml-2 px-4 py-3 text-xs font-black uppercase tracking-tighter rounded-2xl border flex items-center justify-center gap-1 transition-colors ${'
  },
  {
    search: /bg-white\/5 border-white\/10 text-gray-300 hover:bg-white\/10/g,
    replace: 'bg-white hover:bg-gray-200 text-black border-transparent'
  },
  {
    search: /\? 'bg-\[#FF3131\]\/20 border-\[#FF3131\]\/50 text-\[#FF3131\]'/g,
    replace: '? "bg-[#FF3131] hover:bg-red-600 text-black border-transparent"'
  },
  {
    search: /\{isSlacking \? '停止摸鱼 🛑' : '开启摸鱼模式 🫧'\}/g,
    replace: '{isSlacking ? "Stop Fish" : "Fish Mode"}'
  }
];

replacements.forEach(({search, replace}) => {
  code = code.replace(search, replace);
});

fs.writeFileSync('src/App.tsx', code);
console.log('Theme applied successfully.');
