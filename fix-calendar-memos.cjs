const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const calendarCellRegex = /<div key=\{date\} className=\{\`h-14 flex flex-col items-center justify-center rounded-lg border transition-all cursor-pointer hover:scale-\[1\.02\] overflow-hidden \$\{([\s\S]*?)\}\`\}>/;

code = code.replace(
  /<div key=\{date\} className=\{\`h-14 flex flex-col items-center justify-center rounded-lg border transition-all cursor-pointer hover:scale-\[1\.02\] overflow-hidden \$\{([\s\S]*?)\}\`\}>/,
  `<div key={date} 
        onClick={() => setSelectedMemoDate(\`\${calendarDate.getFullYear()}-\${pad0(calendarDate.getMonth() + 1)}-\${pad0(date)}\`)}
        className={\`h-14 flex flex-col items-center justify-center rounded-lg border transition-all cursor-pointer hover:scale-[1.02] overflow-hidden relative \${$1}\`}
     >`
);

// We need to inject the "Memos" display on the cell.
code = code.replace(
  /\{isToday && <div className="absolute -top-1 -right-1 w-2\.5 h-2\.5 bg-red-500 rounded-full border-2 border-app"><\/div>\}/,
  `{isToday && <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-500 rounded-full"></div>}
   {memos[\`\${calendarDate.getFullYear()}-\${pad0(calendarDate.getMonth() + 1)}-\${pad0(date)}\`] && memos[\`\${calendarDate.getFullYear()}-\${pad0(calendarDate.getMonth() + 1)}-\${pad0(date)}\`].length > 0 && (
       <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 flex gap-0.5">
          {memos[\`\${calendarDate.getFullYear()}-\${pad0(calendarDate.getMonth() + 1)}-\${pad0(date)}\`].slice(0,3).map((m, idx) => (
             <div key={idx} className={\`w-1.5 h-1.5 rounded-full \${m.completed ? 'bg-brand/40' : 'bg-brand'}\`}></div>
          ))}
       </div>
   )}`
);

const memoModalCode = `
      {/* Memo Modal */}
      {selectedMemoDate && (
         <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm p-4 md:p-0">
           <motion.div 
             initial={{ y: "100%" }} 
             animate={{ y: 0 }} 
             className="bg-card w-full max-w-md rounded-t-3xl md:rounded-3xl shadow-2xl border border-app overflow-hidden flex flex-col max-h-[80vh]"
           >
             <div className="p-4 md:p-6 border-b border-app flex items-center justify-between bg-card-inner">
               <div className="flex flex-col">
                 <h3 className="text-lg font-bold text-primary">备忘录</h3>
                 <p className="text-xs text-secondary">{selectedMemoDate}</p>
               </div>
               <button onClick={() => setSelectedMemoDate(null)} className="p-2 border border-app rounded-full text-secondary hover:bg-app hover:text-primary transition-colors">
                 <X size={16} />
               </button>
             </div>
             
             <div className="p-4 md:p-6 flex-1 overflow-y-auto space-y-3">
               {(memos[selectedMemoDate] || []).map((memo, idx) => (
                 <div key={memo.id} className={\`flex items-center justify-between p-3 rounded-xl border \${memo.completed ? 'bg-card-inner border-app/50 opacity-60' : 'bg-card border-app shadow-sm'}\`}>
                    <div className="flex items-center gap-3 overflow-hidden">
                       <button onClick={() => {
                          const newMemos = {...memos};
                          newMemos[selectedMemoDate][idx].completed = !newMemos[selectedMemoDate][idx].completed;
                          setMemos(newMemos);
                       }} className={\`shrink-0 \${memo.completed ? 'text-brand' : 'text-tertiary hover:text-brand'}\`}>
                          <CheckCircle size={18} fill={memo.completed ? "currentColor" : "none"} />
                       </button>
                       <span className={\`text-sm truncate \${memo.completed ? 'line-through text-secondary' : 'text-primary'}\`}>{memo.text}</span>
                    </div>
                    <button onClick={() => {
                          const newMemos = {...memos};
                          newMemos[selectedMemoDate].splice(idx, 1);
                          setMemos(newMemos);
                    }} className="text-red-500/50 hover:text-red-500 shrink-0 p-1">
                       <Trash2 size={16} />
                    </button>
                 </div>
               ))}
               {(memos[selectedMemoDate] || []).length === 0 && (
                 <div className="text-center py-8 text-secondary text-sm">
                   这里空空如也，添加点什么吧
                 </div>
               )}
             </div>

             <div className="p-4 bg-card-inner border-t border-app">
               <form onSubmit={(e) => {
                  e.preventDefault();
                  if (!newMemoText.trim()) return;
                  const newMemos = {...memos};
                  if (!newMemos[selectedMemoDate]) newMemos[selectedMemoDate] = [];
                  newMemos[selectedMemoDate].push({ id: Math.random().toString(), text: newMemoText, completed: false });
                  setMemos(newMemos);
                  setNewMemoText("");
               }} className="flex gap-2">
                 <input 
                   type="text" 
                   value={newMemoText}
                   onChange={(e) => setNewMemoText(e.target.value)}
                   placeholder="输入备忘录内容..." 
                   className="flex-1 bg-card border border-app rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand shadow-inner text-primary"
                 />
                 <button type="submit" className="bg-brand text-card p-3 rounded-xl hover:scale-105 active:scale-95 transition-all shadow-md">
                   <Plus size={18} />
                 </button>
               </form>
             </div>
           </motion.div>
         </div>
      )}
`;

code = code.replace(/\{\/\* BOTTOM NAV BAR \*\/\}/, memoModalCode + '\n      {/* BOTTOM NAV BAR */}');

fs.writeFileSync('src/App.tsx', code);
