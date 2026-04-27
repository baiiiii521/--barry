const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  /<div className="absolute bottom-0\.5 left-1\/2 -translate-x-1\/2 flex gap-0\.5">\s*\{memos\[\`\$\{calendarDate\.getFullYear\(\)\}-\$\{pad0\(calendarDate\.getMonth\(\) \+ 1\)\}-\$\{pad0\(date\)\}\`\]\.slice\(0,3\)\.map\(\(m, idx\) => \(\s*<div key=\{idx\} className=\{\`w-1\.5 h-1\.5 rounded-full \$\{m\.completed \? 'bg-brand\/40' : 'bg-brand'\}\`\}><\/div>\s*\)\)\}\s*<\/div>/,
  '<div className="absolute top-1 left-1 flex gap-0.5 max-w-[16px] flex-wrap">\n          {memos[`${calendarDate.getFullYear()}-${pad0(calendarDate.getMonth() + 1)}-${pad0(date)}`].slice(0,3).map((m, idx) => (\n             <div key={idx} className={`w-1 h-1 rounded-full ${m.completed ? \'bg-brand/40\' : \'bg-brand\'}`}></div>\n          ))}\n       </div>'
);

fs.writeFileSync('src/App.tsx', code);
