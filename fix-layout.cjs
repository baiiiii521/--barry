const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const wrapperRegex = /<div className="px-4 pt-6 pb-2 flex flex-col gap-2">/;
code = code.replace(wrapperRegex, '<div className="px-4 md:px-8 pt-6 pb-2 flex flex-col gap-4 max-w-5xl mx-auto w-full">');

const replaceBlockRegex = /\{\/\* Header \/ Brand \*\/\}[\s\S]*?\{\/\* Timezone Card \*\/\}/;

const newBlock = `{/* Header & Date Row */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 mt-2">
              {/* Brand & Logo */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-gradient-to-br from-brand/20 via-card to-brand/5 border border-brand/30 flex items-center justify-center text-brand shadow-[0_0_20px_rgba(0,255,65,0.25)] shrink-0 relative overflow-hidden">
                   <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                   <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="relative z-10 drop-shadow-md">
                     <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2" />
                     <line x1="12" y1="22" x2="12" y2="15.5" />
                     <polyline points="22 8.5 12 15.5 2 8.5" />
                     <polyline points="2 15.5 12 8.5 22 15.5" />
                     <line x1="12" y1="2" x2="12" y2="8.5" />
                     <circle cx="12" cy="12" r="1.5" className="fill-brand stroke-brand" />
                   </svg>
                </div>
                <div className="flex flex-col justify-center">
                  <h1 className="text-xl md:text-[22px] font-bold tracking-tight text-primary leading-none mb-1.5 flex items-center gap-2">
                    TimeMeter
                    <span className="text-[9px] bg-brand/10 text-brand px-1.5 py-0.5 rounded font-mono font-medium border border-brand/20">BETA</span>
                  </h1>
                  <p className="text-[10px] text-brand/90 font-mono uppercase tracking-[0.2em] font-bold leading-none">Pay Per Second</p>
                </div>
              </div>

              {/* Date & Theme Toggle */}
              <div className="flex items-center gap-3 bg-card-inner/60 backdrop-blur-md pl-4 pr-2 py-1.5 rounded-2xl border border-app shadow-sm mt-2 md:mt-0 w-fit">
                <div className="flex flex-col text-right">
                  <div className="text-sm font-semibold text-primary mb-0.5 flex items-center gap-2 justify-end">
                    <span className="text-xs text-secondary font-medium">周{['日','一','二','三','四','五','六'][localTime.getDay()]}</span>
                    {localTime.getFullYear()}年{localTime.getMonth() + 1}月{localTime.getDate()}日 
                  </div>
                  <div className="text-[10px] text-secondary/80 font-medium tracking-wide">
                     {lunarDateStr}
                  </div>
                </div>
                <div className="w-[1px] h-6 bg-app block mx-1"></div>
                <button onClick={() => setIsLightMode(!isLightMode)} className="w-8 h-8 bg-card rounded-xl border border-app shadow-inner text-primary flex items-center justify-center transition-all hover:scale-105 active:scale-95 group focus:outline-none focus:ring-2 focus:ring-brand">
                   {isLightMode ? (
                     <svg className="w-4 h-4 text-amber-500 group-hover:rotate-45 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                   ) : (
                     <svg className="w-4 h-4 text-brand group-hover:-rotate-12 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                   )}
                </button>
              </div>
            </div>

            {/* Daily Work Progress */}
            <div className="bg-gradient-to-r from-card to-card-inner rounded-[24px] p-4 md:p-5 border-[1.5px] border-app flex flex-col shadow-xl relative overflow-hidden mb-2">
              <div className="w-full flex-col flex gap-2">
                <div className="flex justify-between items-end text-[11px] font-medium text-tertiary">
                  <span className="flex items-center gap-1.5 object-contain"><svg className="w-3.5 h-3.5 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg> <span className="tracking-wide">今日打工进度</span></span>
                  <span className="text-primary font-mono bg-card-inner px-2 py-0.5 rounded-full border border-app shadow-sm">{isRestDay ? '周末躺平' : nowSecs < startSecs ? '还未上班' : nowSecs > endSecs ? '已下班' : \`\${((workSecondsToday / (endSecs - startSecs - (config.hasLunchBreak ? lunchEndSecs - lunchStartSecs : 0))) * 100).toFixed(1)}%\`}</span>
                </div>
                <div className="h-2 bg-card-inner/80 rounded-full overflow-hidden border border-app/50 relative">
                   <div 
                     className="absolute top-0 left-0 h-full bg-gradient-to-r from-brand/60 to-brand shadow-[0_0_10px_rgba(0,255,65,0.6)] transition-all duration-1000" 
                     style={{ width: \`\${nowSecs < startSecs ? 0 : nowSecs > endSecs ? 100 : ((workSecondsToday / (endSecs - startSecs - (config.hasLunchBreak ? lunchEndSecs - lunchStartSecs : 0))) * 100)}%\` }} 
                   >
                   </div>
                </div>
              </div>
            </div>

            {/* Timezone Card */}`;

code = code.replace(replaceBlockRegex, newBlock);
fs.writeFileSync('src/App.tsx', code);
