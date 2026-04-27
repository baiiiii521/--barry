const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const navCode = `{/* BOTTOM NAV BAR */}
      <div className="fixed bottom-0 left-0 right-0 w-full md:max-w-4xl lg:max-w-6xl xl:max-w-[1400px] mx-auto bg-card-inner/90 backdrop-blur-lg border-t md:border border-app py-2 md:py-4 px-4 md:px-16 flex justify-between items-center z-50 md:rounded-b-3xl md:rounded-t-none md:bottom-4 xl:rounded-3xl shadow-2xl md:mb-4 xl:mb-0 transition-all duration-300">
         <NavItem icon={<Home size={22} />} label="首页" active={activeTab === 'home'} onClick={() => setActiveTab('home')} />
         <NavItem icon={<Timer size={22} />} label="番茄钟" active={activeTab === 'pomodoro'} onClick={() => setActiveTab('pomodoro')} />
         <NavItem icon={<CalendarIcon size={22} />} label="日历" active={activeTab === 'calendar'} onClick={() => { setActiveTab('calendar'); setCalendarDate(new Date()); }} />
         <NavItem icon={<PieChart size={22} />} label="数据" active={activeTab === 'data'} onClick={() => setActiveTab('data')} />
         <NavItem icon={<Settings size={22} />} label="设定" active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} />
      </div>`;

code = code.replace(/\{\/\* BOTTOM NAV BAR \*\/\}[\s\S]*?<\/div>/, navCode);

const notFoundRegex = /\{activeTab !== 'home' && activeTab !== 'profile' && activeTab !== 'data' && activeTab !== 'calendar' && \([\s\S]*?\}\)/;
code = code.replace(notFoundRegex, `{activeTab !== 'home' && activeTab !== 'pomodoro' && activeTab !== 'profile' && activeTab !== 'data' && activeTab !== 'calendar' && (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-card-inner z-40 absolute inset-0 top-0">
           <h2 className="text-xl font-bold mb-2">🚧 正在施工</h2>
           <p className="text-sm">功能正在开发中...</p>
           <p className="text-xs text-secondary mt-1">Please come back later</p>
        </div>
      )}`);

// Render Pomodoro Section
const pomodoroContent = `
      {activeTab === 'pomodoro' && (
        <div className="flex-1 overflow-y-auto no-scrollbar px-4 md:px-8 pt-6 pb-24 absolute inset-0 top-0 z-40 bg-card-inner md:rounded-3xl max-w-4xl mx-auto w-full">
           <div className="flex flex-col items-center justify-center h-full max-h-[800px]">
             
             <div className="mb-8 w-full max-w-sm text-center">
               <h2 className="text-2xl font-bold tracking-tight text-primary">沉浸番茄钟</h2>
               <p className="text-xs text-secondary mt-1 font-medium">专注一炷香，干完去放飞</p>
             </div>

             <div className="w-full max-w-sm bg-card border border-app rounded-[32px] p-6 shadow-2xl relative overflow-hidden flex flex-col items-center">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-brand/5 blur-3xl rounded-full pointer-events-none" />
                 
                 <div className="relative w-48 h-48 mb-6 flex items-center justify-center shrink-0">
                     <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                       <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" className="text-app-strong" strokeWidth="2" strokeDasharray="1 4" />
                       <circle 
                         cx="50" cy="50" r="46" fill="none" 
                         stroke="currentColor" strokeWidth="4" 
                         className={(isPomodoroActive || pomodoroTimeLeft !== pomodoroLength * 60) ? "text-brand" : "text-app"}
                         strokeDasharray={289} 
                         strokeDashoffset={289 - (289 * (pomodoroTimeLeft / (pomodoroLength * 60)))} 
                         strokeLinecap="round" 
                         style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.3s ease' }}
                       />
                     </svg>
                     <div className="text-5xl font-mono font-bold text-primary tabular-nums tracking-tighter">
                       {pad0(Math.floor(pomodoroTimeLeft / 60))}:{pad0(pomodoroTimeLeft % 60)}
                     </div>
                 </div>

                 {/* task input */}
                 <div className="w-full mb-6">
                    <input 
                      type="text" 
                      value={pomodoroTask}
                      onChange={(e) => setPomodoroTask(e.target.value)}
                      placeholder="几炷香时间我将完成..." 
                      className="w-full bg-card-inner border border-app rounded-xl p-3 text-center text-sm focus:outline-none focus:ring-2 focus:ring-brand shadow-inner text-primary placeholder:text-tertiary"
                    />
                 </div>

                 {/* buttons */}
                 <div className="flex items-center gap-4">
                    {!isPomodoroActive && pomodoroTimeLeft === pomodoroLength * 60 ? (
                       <button onClick={togglePomodoro} className="w-16 h-16 bg-brand text-card rounded-2xl flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all">
                         <Play size={28} className="ml-1" />
                       </button>
                    ) : (
                       <>
                         <button onClick={togglePomodoro} className="w-14 h-14 bg-card-inner border border-app text-primary rounded-2xl flex items-center justify-center shadow hover:scale-105 active:scale-95 transition-all">
                           {isPomodoroActive ? <Pause size={24} /> : <Play size={24} className="ml-1" />}
                         </button>
                         <button onClick={resetPomodoro} className="w-14 h-14 bg-card-inner border border-app text-red-500 rounded-2xl flex items-center justify-center shadow hover:scale-105 active:scale-95 transition-all">
                           <Square size={20} fill="currentColor" />
                         </button>
                       </>
                    )}
                 </div>
             </div>

             {/* Presets */}
             <div className="mt-8 flex gap-3 text-xs">
                <button onClick={() => handlePomodoroLengthChange(25)} className={\`px-4 py-2 rounded-full border \${pomodoroLength === 25 ? 'bg-brand/10 border-brand/30 text-brand font-bold' : 'bg-card border-app text-secondary hover:text-primary'}\`}>
                  25分钟
                </button>
                <button onClick={() => handlePomodoroLengthChange(50)} className={\`px-4 py-2 rounded-full border \${pomodoroLength === 50 ? 'bg-brand/10 border-brand/30 text-brand font-bold' : 'bg-card border-app text-secondary hover:text-primary'}\`}>
                  50分钟
                </button>
                <button onClick={() => handlePomodoroLengthChange(90)} className={\`px-4 py-2 rounded-full border \${pomodoroLength === 90 ? 'bg-brand/10 border-brand/30 text-brand font-bold' : 'bg-card border-app text-secondary hover:text-primary'}\`}>
                  90分钟
                </button>
             </div>

             {completedPomodoros > 0 && (
                <div className="mt-6 text-sm text-secondary flex items-center gap-2">
                   今日已集齐 <span className="text-brand font-bold">{completedPomodoros}</span> 个番茄 🍅
                </div>
             )}
           </div>
        </div>
      )}
`;

code = code.replace(/(?=\{activeTab === 'calendar' && \()/, pomodoroContent);
fs.writeFileSync('src/App.tsx', code);
