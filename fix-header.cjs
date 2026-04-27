const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const oldHeader = `{/* Header / Brand */}
            <div className="flex flex-col items-center justify-center pt-2 pb-6 max-w-5xl mx-auto w-full">
              <img src="/logo.png" alt="TimeMeter Logo" className="w-20 h-20 rounded-3xl object-cover mb-3 shadow-xl border border-app bg-card-inner" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling!.style.display = 'flex'; }} />
              <div className="hidden flex-col items-center justify-center mb-3">
                 <div className="w-20 h-20 rounded-3xl bg-brand/10 flex items-center justify-center shadow-xl border border-brand/20 text-brand text-3xl font-black mb-1">
                    TM
                 </div>
                 <div className="text-[9px] text-secondary/70">👈 在左侧 public 目录上传 <br/> logo.png 即可替换此图标</div>
              </div>
              <h1 className="text-xl font-bold tracking-tight text-primary">TimeMeter: Pay Per Second</h1>
              <p className="text-xs text-brand mt-1 font-mono uppercase tracking-widest font-black">Time is literally money.</p>
            </div>`;

const newHeader = `{/* Header / Brand */}
            <div className="flex items-center gap-3 pt-2 pb-6 max-w-5xl mx-auto w-full md:px-0">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand/20 to-brand/5 border border-brand/30 flex items-center justify-center text-brand shadow-[0_0_15px_rgba(0,255,65,0.2)] shrink-0">
                 <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                   <path d="M12 2v20" />
                   <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                 </svg>
              </div>
              <div className="flex flex-col">
                <h1 className="text-lg font-bold tracking-tight text-primary leading-none mb-1">TimeMeter</h1>
                <p className="text-[10px] text-brand font-mono uppercase tracking-widest font-bold leading-none">Pay Per Second</p>
              </div>
            </div>`;

code = code.replace(oldHeader, newHeader);

fs.writeFileSync('src/App.tsx', code);
