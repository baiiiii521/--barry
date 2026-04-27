import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { Solar } from 'lunar-javascript';
import Holidays from 'date-holidays';
import {
  Settings,
  RefreshCw,
  Calendar as CalendarIcon,
  Eye,
  EyeOff,
  Home,
  PieChart,
  Briefcase,
  ChevronRight,
  ChevronLeft,
  TrendingUp,
} from 'lucide-react';

const MILK_TEA_PRICE = 20;
const COFFEE_PRICE = 30;
const GAS_PRICE = 8; // per Liter
const IPHONE_PRICE = 7999;

// --- FORMATTERS ---
const formatMoney = (amount: number) => {
  return amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const pad0 = (num: number) => num.toString().padStart(2, '0');

// Timezones options
const TIMEZONES = [
  { label: '🇨🇳 北京', value: 'Asia/Shanghai', short: '北京' },
  { label: '🇹🇭 曼谷', value: 'Asia/Bangkok', short: '曼谷' },
  { label: '🇻🇳 胡志明', value: 'Asia/Ho_Chi_Minh', short: '胡志明' },
  { label: '🇨🇳 香港', value: 'Asia/Hong_Kong', short: '香港' },
  { label: '🇯🇵 东京', value: 'Asia/Tokyo', short: '东京' },
  { label: '🇺🇸 纽约', value: 'America/New_York', short: '纽约' },
  { label: '🇬🇧 伦敦', value: 'Europe/London', short: '伦敦' },
  { label: '🇦🇺 悉尼', value: 'Australia/Sydney', short: '悉尼' },
  { label: '🇫🇷 巴黎', value: 'Europe/Paris', short: '巴黎' },
];

const getLocalTzInfo = () => {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Shanghai';
    const match = TIMEZONES.find(t => t.value === tz);
    return { value: tz, label: match ? match.short : (tz.split('/').pop() || '本地') };
  } catch (e) {
    return { value: 'Asia/Shanghai', label: '北京' };
  }
};

const initialTz = getLocalTzInfo();

const getWorkDaysInMonth = (year: number, month: number, region: string, restDays: number) => {
  const hd = new Holidays(region);
  let workdays = 0;
  const days = new Date(year, month + 1, 0).getDate();
  for (let i = 1; i <= days; i++) {
    const d = new Date(year, month, i);
    const day = d.getDay();
    const isRest = restDays === 2 ? (day === 0 || day === 6) : (day === 0);
    const h = hd.isHoliday(d);
    const isPublic = h && h.some((x: any) => x.type === 'public');
    if (!isRest && !isPublic) {
      workdays++;
    }
  }
  return workdays || 21.75; // Fallback to avoid div by zero
};

export default function App() {
  const [profiles, setProfiles] = useState(() => {
    try {
      const saved = localStorage.getItem('niuma_profiles');
      if (saved) return JSON.parse(saved);
    } catch(e) {}
    return [];
  });
  const [currentProfileName, setCurrentProfileName] = useState('');
  
  useEffect(() => {
    localStorage.setItem('niuma_profiles', JSON.stringify(profiles));
  }, [profiles]);
  const [isLightMode, setIsLightMode] = useState(false);

  useEffect(() => {
    if (isLightMode) {
      document.body.classList.add('theme-light');
    } else {
      document.body.classList.remove('theme-light');
    }
  }, [isLightMode]);

  const [config, setConfig] = useState(() => {
    try {
      const savedConfig = localStorage.getItem('niuma_config');
      if (savedConfig) return JSON.parse(savedConfig);
    } catch(e) {}
    return {
    monthlySalary: 25000,
    holidayRegion: 'CN',
    restDays: 2, // 2 for double rest, 1 for single
    hoursPerDay: 8,
    exchangeRateUsd: 6.80,
    joinDate: '2021-06-01',
    firstPayDate: '2021-07-05',
    payday: 5,
    startTime: '09:00',
    endTime: '18:00',
    hasLunchBreak: true,
    lunchStartTime: '12:00',
    lunchEndTime: '13:00',
    customItemName: '自定义', 
    customItemPrice: 100,
    customEventName: '出生多少天了',
    customEventDate: '2000-01-01',
    retirementDate: '2050-01-01',
    otherTimezone: 'Asia/Ho_Chi_Minh',
    otherTimezoneLabel: '胡志明',
    localTimezone: initialTz.value,
    localTimezoneLabel: initialTz.label,
    };
  });
  
  useEffect(() => {
    localStorage.setItem('niuma_config', JSON.stringify(config));
  }, [config]);



  const [activeTab, setActiveTab] = useState('home');
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [now, setNow] = useState(new Date());
  
  const localTime = new Date(now.toLocaleString("en-US", {timeZone: config.localTimezone}));
  
  // Dynamic average work days calculated to represent 'hourly rate' today. Let's use the current month for calculation.
  const currentMonthWorkDays = useMemo(() => {
    return getWorkDaysInMonth(localTime.getFullYear(), localTime.getMonth(), config.holidayRegion, config.restDays);
  }, [localTime.getFullYear(), localTime.getMonth(), config.holidayRegion, config.restDays]);

  const hourlyRate = config.monthlySalary / (currentMonthWorkDays * config.hoursPerDay);
  const minuteRate = hourlyRate / 60;
  const secondRate = minuteRate / 60;

  const [isSlacking, setIsSlacking] = useState(false);
  const [isOvertime, setIsOvertime] = useState(false);
  const [showMoney, setShowMoney] = useState(true);
  const [showUSD, setShowUSD] = useState(false);
  const [excuse, setExcuse] = useState('刚刚我的键盘卡主了，我在测试硬件抗冲击力...');
  
  const generateExcuse = () => {
    const excuses = [
      "报告老板，我的键盘正在进行系统级的自我净化。",
      "正在等npm装包，进度条卡在99%已经十分钟了。",
      "我在测试系统的抗压能力，顺便研究下缓存为什么没失效。",
      "刚才闭眼是在做需求可视化，绝不是在打盹。",
      "领导，这叫敏捷开发中的‘战略性停顿’。",
      "不是在发呆，是在和产品的灵魂深切对话，寻找业务痛点。",
      "眼睛干涩，正在执行医嘱：眺望远方20英尺外20秒。",
      "这不是摸鱼，这是在为下一行能够改变世界的代码积攒灵感。",
      "我在思考如何重构底层的屎山代码，太复杂了脑壳疼。",
      "正在查阅行业前沿资料，分析竞品的最新动态。",
      "刚才在想中午跟同事去吃哪家对团队建设最有帮助。",
      "本地环境崩了，正在重新配，太难了！"
    ];
    setExcuse(excuses[Math.floor(Math.random() * excuses.length)]);
  };

  // Accumulated data
  const [slackSecondsToday, setSlackSecondsToday] = useState(0);
  const [overtimeSecondsToday, setOvertimeSecondsToday] = useState(0);
  
  // Real-time timepieces and lunar
  const otherTime = new Date(now.toLocaleString("en-US", {timeZone: config.otherTimezone}));
  const lunar = Solar.fromDate(localTime).getLunar();
  const lunarDateStr = `农历${lunar.getMonthInChinese()}月${lunar.getDayInChinese()} ${lunar.getYearInGanZhi()}年`;

  // Work calculation
  const getSecondsFromMidnight = (timeStr: string) => {
    const [h,m] = timeStr.split(':').map(Number);
    return (h || 0) * 3600 + (m || 0) * 60;
  };

  const nowSecs = localTime.getHours() * 3600 + localTime.getMinutes() * 60 + localTime.getSeconds();
  const startSecs = getSecondsFromMidnight(config.startTime);
  const endSecs = getSecondsFromMidnight(config.endTime);
  const lunchStartSecs = getSecondsFromMidnight(config.lunchStartTime);
  const lunchEndSecs = getSecondsFromMidnight(config.lunchEndTime);

  const todayDay = localTime.getDay();
  const isRestDay = (config.restDays === 2 && (todayDay === 0 || todayDay === 6)) || (config.restDays === 1 && todayDay === 0);

  let autoWorkSecs = 0;
  if (!isRestDay && nowSecs > startSecs) {
    autoWorkSecs = Math.min(nowSecs, endSecs) - startSecs;
    if (config.hasLunchBreak) {
      if (nowSecs > lunchStartSecs) {
         autoWorkSecs -= (Math.min(nowSecs, lunchEndSecs) - lunchStartSecs);
      }
    }
  }
  const workSecondsToday = Math.max(0, autoWorkSecs);

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
      if (isSlacking) {
        setSlackSecondsToday(prev => prev + 1);
      }
      if (isOvertime) {
        setOvertimeSecondsToday(prev => prev + 1);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [isSlacking, isOvertime]);

  const earnedToday = workSecondsToday * secondRate;
  const slackLoss = slackSecondsToday * secondRate;
  const overtimeLoss = overtimeSecondsToday * secondRate;
  const sym = showUSD ? '$' : '¥';
  const ex = showUSD ? config.exchangeRateUsd : 1;
  const hide = (val: string) => showMoney ? val : '****';
  
  // Estimations for summary
  const joinDateObj = new Date(config.joinDate);
  const firstPayObj = new Date(config.firstPayDate || config.joinDate);
  const monthsWorked = (localTime.getFullYear() - joinDateObj.getFullYear()) * 12 + localTime.getMonth() - joinDateObj.getMonth();
  const monthsPaid = Math.max(0, (localTime.getFullYear() - firstPayObj.getFullYear()) * 12 + localTime.getMonth() - firstPayObj.getMonth());
  const totalEarnedBeforeToday = Math.max(0, monthsPaid * config.monthlySalary);
  
  const daysInMonth = new Date(localTime.getFullYear(), localTime.getMonth() + 1, 0).getDate();
  const workRatio = currentMonthWorkDays / (daysInMonth || 30);
  const earnedThisMonth = Math.max(0, (config.monthlySalary / daysInMonth) * Math.max(0, localTime.getDate() - 1) + earnedToday);
  const hoursThisMonth = Math.max(0, (config.hoursPerDay * workRatio) * Math.max(0, localTime.getDate() - 1) + (workSecondsToday / 3600));
  
  // Countdown calculations
  const offWorkSecs = Math.max(0, endSecs - nowSecs);
  
  const paydayObj = new Date(localTime.getFullYear(), localTime.getMonth(), config.payday);
  if (localTime > paydayObj) {
     paydayObj.setMonth(paydayObj.getMonth() + 1);
  }
  const daysToPayday = Math.ceil((paydayObj.getTime() - localTime.getTime()) / (1000 * 3600 * 24));
  
  const weekendObj = new Date(localTime);
  const daysToWeekend = 6 - localTime.getDay();
  weekendObj.setDate(localTime.getDate() + daysToWeekend);
  
  const customDateObj = new Date(config.customEventDate);
  const daysToCustom = Math.ceil((customDateObj.getTime() - localTime.getTime()) / (1000 * 3600 * 24));

  const retireDateObj = new Date(config.retirementDate);
  const daysToRetire = Math.ceil((retireDateObj.getTime() - localTime.getTime()) / (1000 * 3600 * 24));
  

  return (
    <div className="w-full min-h-[100dvh] md:max-w-4xl lg:max-w-6xl xl:max-w-[1400px] mx-auto bg-app text-primary font-sans overflow-x-hidden pb-24 md:pb-0 relative flex flex-col transition-colors duration-300 md:shadow-2xl md:my-4 md:rounded-3xl border-x md:border-y border-app duration-500">
      
      {activeTab === 'home' && (
        <div className="flex-1 overflow-y-auto no-scrollbar pb-24">
          <div className="px-4 pt-6 pb-2 flex flex-col gap-2">
            
            {/* Header / Brand */}
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
            </div>

            {/* Date Card */}
            <div className="bg-gradient-to-br from-card to-card-inner rounded-[32px] p-5 md:p-8 border-[1.5px] border-app flex flex-col shadow-xl relative overflow-hidden">
              <div className="flex flex-row items-center justify-between mb-3">
                <div className="flex items-center justify-between w-full">
                  <div className="flex flex-col">
                    <div className="text-sm font-medium text-primary mb-0.5">
                      {localTime.getFullYear()}年{localTime.getMonth() + 1}月{localTime.getDate()}日 
                      <span className="ml-2 text-xs text-secondary">周{['日','一','二','三','四','五','六'][localTime.getDay()]}</span>
                    </div>
                    <div className="text-[11px] text-secondary flex items-center gap-2">
                       <span>{lunarDateStr}</span>
                    </div>
                  </div>
                  <button onClick={() => setIsLightMode(!isLightMode)} className="p-1.5 px-2.5 bg-card-inner rounded-full border border-app shadow-sm text-primary flex items-center gap-1 text-[11px] transition-transform hover:scale-105 active:scale-95">{isLightMode ? '🌙' : '☀️'}</button>
                </div>
              </div>
              
              {/* Daily Work Progress */}
              <div className="w-full flex-col flex gap-1.5 mt-1">
                <div className="flex justify-between text-[10px] text-tertiary">
                  <span>今日打工进度</span>
                  <span>{isRestDay ? '周末躺平' : nowSecs < startSecs ? '还未上班' : nowSecs > endSecs ? '已下班' : `${((workSecondsToday / (endSecs - startSecs - (config.hasLunchBreak ? lunchEndSecs - lunchStartSecs : 0))) * 100).toFixed(1)}%`}</span>
                </div>
                <div className="h-1.5 bg-card-inner rounded-full overflow-hidden border border-app">
                   <div 
                     className="h-full bg-brand shadow-[0_0_8px_rgba(0,255,65,0.4)] transition-all duration-1000" 
                     style={{ width: `${nowSecs < startSecs ? 0 : nowSecs > endSecs ? 100 : ((workSecondsToday / (endSecs - startSecs - (config.hasLunchBreak ? lunchEndSecs - lunchStartSecs : 0))) * 100)}%` }} 
                   />
                </div>
              </div>
            </div>

            {/* Timezone Card */}
            <div className="bg-card rounded-2xl p-3 border border-app flex flex-row items-center justify-between relative shadow-sm">
                <div className="flex flex-col relative w-1/2 overflow-hidden">
                   <select 
                     className="absolute top-0 left-0 w-24 h-full opacity-0 cursor-pointer appearance-none z-10"
                     value={config.localTimezone}
                     onChange={(e) => {
                       const tz = TIMEZONES.find(t => t.value === e.target.value);
                       if (tz) setConfig({...config, localTimezone: tz.value, localTimezoneLabel: tz.short});
                     }}
                   >
                     {TIMEZONES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                   </select>
                   <div className="text-[10px] text-tertiary mb-0.5 flex items-center gap-1 group">
                     {config.localTimezoneLabel}时间 <span className="transform rotate-90 text-[8px] opacity-70 group-hover:opacity-100 mix-blend-screen transition-opacity">▸</span>
                   </div>
                   <div className="text-xl font-mono text-brand font-semibold leading-none drop-shadow-[0_0_8px_rgba(0,255,65,0.4)]">{pad0(localTime.getHours())}:{pad0(localTime.getMinutes())}:{pad0(localTime.getSeconds())}</div>
                   <div className="text-[9px] text-primary/40 mt-1 truncate max-w-[80%]">{config.localTimezone.split('/')[1] || config.localTimezone}</div>
                </div>
                
                <RefreshCw size={14} className="text-primary/20 mx-1 shrink-0" />
                
                <div className="flex flex-col items-end text-right relative w-1/2 overflow-hidden">
                   <select 
                     className="absolute inset-0 w-full h-full opacity-0 cursor-pointer appearance-none z-10"
                     value={config.otherTimezone}
                     onChange={(e) => {
                       const tz = TIMEZONES.find(t => t.value === e.target.value);
                       if (tz) setConfig({...config, otherTimezone: tz.value, otherTimezoneLabel: tz.short});
                     }}
                   >
                     {TIMEZONES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                   </select>
                   <div className="text-[10px] text-tertiary mb-0.5 flex items-center justify-end w-full gap-1 group">
                     {config.otherTimezoneLabel}时间 <span className="transform rotate-90 text-[8px] opacity-70 group-hover:opacity-100 mix-blend-screen transition-opacity">▸</span>
                   </div>
                   <div className="text-xl font-mono text-primary font-medium leading-none">{pad0(otherTime.getHours())}:{pad0(otherTime.getMinutes())}:{pad0(otherTime.getSeconds())}</div>
                   <div className="text-[9px] text-primary/40 mt-1 truncate max-w-[80%] text-right float-right">{config.otherTimezone.split('/')[1] || config.otherTimezone}</div>
                </div>
            </div>
          </div>
          {/* Marquee Banner */}
          <div className="px-4 py-2">
            <div className="bg-card rounded-full px-3 py-2 text-xs flex items-center justify-between border border-app">
               <div className="flex items-center gap-2 text-yellow-500/80 truncate pr-2">
                  <span>📢</span>
                  <span className="truncate">距离发工资还有 {daysToPayday} 天，再坚持一下！💪</span>
               </div>
               <div className="flex items-center gap-1 text-secondary cursor-pointer whitespace-nowrap relative shrink-0" onClick={() => {
                  const input = document.getElementById('native-calendar') as HTMLInputElement;
                  if (input && 'showPicker' in input) {
                    try { input.showPicker(); } catch (e) { input.focus(); }
                  } else if (input) {
                    input.click();
                  }
               }}>
                  <span>查看日历</span>
                  <CalendarIcon size={12} />
                  <div className="absolute inset-0" onClick={() => setActiveTab('calendar')}></div>
               </div>
            </div>
          </div>

          {/* 2. WORK STATUS & REAL-TIME INCOME */}
          <div className="px-4 md:px-8 py-2 flex flex-col gap-3 md:gap-5 max-w-5xl mx-auto w-full">
             {/* Top Row: Clock & Punch Out vs Current Income (Side by side) */}
             <div className="flex gap-3 md:gap-5">
               {/* Left: Clock */}
               <div className="w-[140px] md:w-[180px] rounded-[32px] bg-card border-[1.5px] border-app p-4 flex flex-col items-center justify-between shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-brand/10 blur-2xl rounded-full mix-blend-screen pointer-events-none" />
                  
                  <div className="relative w-24 h-24 mb-3 drop-shadow-[0_0_10px_rgba(0,255,65,0.2)] shrink-0">
                     <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                       <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" className="text-app-strong" strokeWidth="2" strokeDasharray="1 4" />
                       <g className="origin-center animate-[spin_10s_linear_infinite]">
                         <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" className="text-brand/40" strokeWidth="2" strokeDasharray="20 40 10 20" strokeLinecap="round" />
                       </g>
                       <g className="origin-center animate-[spin_15s_linear_infinite_reverse]">
                         <circle cx="50" cy="50" r="38" fill="none" stroke="currentColor" className="text-brand/20" strokeWidth="1" strokeDasharray="5 15" strokeLinecap="round" />
                       </g>
                       <circle 
                         cx="50" cy="50" r="46" fill="none" 
                         stroke="url(#cow_gradient)" strokeWidth="4" 
                         strokeDasharray={289} 
                         strokeDashoffset={289 * (1 - (workSecondsToday / Math.max(1, (endSecs - startSecs))))} 
                         className="transition-all duration-1000 ease-linear" 
                         strokeLinecap="round" 
                       />
                       <defs>
                         <linearGradient id="cow_gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                           <stop offset="0%" stopColor="#00FF41" />
                           <stop offset="100%" stopColor="#00cc33" />
                         </linearGradient>
                       </defs>
                     </svg>
                     <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                        <div className="text-3xl filter drop-shadow-md relative transform hover:scale-110 transition-transform duration-300">
                           🐮
                           <div className="text-lg absolute -bottom-1 -right-2">💻</div>
                        </div>
                     </div>
                  </div>

                  <div className="text-center z-10 w-full mb-3">
                     <div className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider mb-1 inline-block ${isRestDay ? 'text-primary bg-blue-500/10' : nowSecs < startSecs ? 'text-secondary bg-secondary/10' : nowSecs > endSecs ? 'text-brand bg-brand/10' : 'text-primary bg-primary/10'}`}>
                        {isRestDay ? '周末休息 ✨' : nowSecs < startSecs ? '未上班' : nowSecs > endSecs ? '已下班' : '工作中'}
                     </div>
                     <div className="text-[18px] font-mono font-bold tracking-tight text-primary/90">
                        {pad0(Math.floor(workSecondsToday / 3600))}:
                        {pad0(Math.floor((workSecondsToday % 3600) / 60))}:
                        {pad0(workSecondsToday % 60)}
                     </div>
                  </div>

                  <div className="w-full mb-1">
                     <div className="bg-card-inner rounded-xl p-1.5 border border-app text-center">
                        <span className="text-[9px] text-tertiary block mb-0.5">精神状态</span>
                        <span className="text-[11px] font-medium text-primary">
                          {isRestDay ? "🏖️ 幸福躺平" :
                           nowSecs > endSecs ? "🎉 满血复活" : 
                           (workSecondsToday / Math.max(1, (endSecs - startSecs))) > 0.9 ? "💀 灵魂出窍" :
                           (workSecondsToday / Math.max(1, (endSecs - startSecs))) > 0.7 ? "🤯 逐渐暴躁" :
                           (workSecondsToday / Math.max(1, (endSecs - startSecs))) > 0.4 ? "🔋 电量过半" :
                           (workSecondsToday / Math.max(1, (endSecs - startSecs))) > 0.2 ? "🤔 陷入沉思" :
                           "☕️ 能量满满"}
                        </span>
                     </div>
                  </div>

                  <div className="w-full py-2 rounded-xl flex flex-col items-center justify-center font-black uppercase tracking-tighter bg-card border-none">
                    <span className={`text-xs ${isRestDay ? 'text-primary' : nowSecs < startSecs ? 'text-secondary' : nowSecs > endSecs ? 'text-brand' : 'text-primary'}`}>
                      {isRestDay ? '周末愉快 🏖️' : nowSecs < startSecs ? '等待打工' : nowSecs > endSecs ? '下班啦 ✨' : '正在牛马 ⚡️'}
                    </span>
                  </div>
               </div>

               {/* Right: Income Main Metrics */}
               <div className="flex-1 rounded-[32px] bg-gradient-to-b from-card to-card-inner border-[1.5px] border-app p-5 flex flex-col shadow-2xl justify-between relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-brand/5 blur-3xl rounded-full pointer-events-none" />

                  <div>
                    <div className="flex items-center justify-between text-xs text-secondary mb-2">
                       <span>今日已赚</span>
                       <div className="flex items-center gap-1.5">
                          <button onClick={() => setShowUSD(!showUSD)} className={`text-[9px] px-1.5 py-0.5 rounded border transition-colors ${showUSD ? 'border-brand text-brand' : 'border-app-strong text-secondary hover:text-primary'}`}>USD</button>
                          <button onClick={() => setShowMoney(!showMoney)} className="text-tertiary hover:text-primary">
                             {showMoney ? <Eye size={14} /> : <EyeOff size={14} />}
                          </button>
                       </div>
                    </div>
                    
                    <div className="flex items-baseline gap-1">
                       <span className="text-brand text-xl font-mono opacity-80">{sym}</span>
                       <motion.span 
                         key={earnedToday}
                         initial={{ opacity: 0.8, y: 2 }}
                         animate={{ opacity: 1, y: 0 }}
                         className="text-4xl md:text-5xl font-mono font-bold text-brand tracking-tighter leading-none"
                       >
                         {hide(formatMoney(earnedToday / ex))}
                       </motion.span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 mt-4">
                     <div className="bg-card-inner rounded-xl p-2.5 flex items-center justify-between border border-app">
                        <div className="flex flex-col">
                           <span className="text-[9px] text-tertiary mb-0.5">本月已赚（预估）</span>
                           <span className="text-primary font-mono text-xs">{sym} {hide(formatMoney(earnedThisMonth / ex))}</span>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-brand/10 flex items-center justify-center text-brand">💰</div>
                     </div>
                     <div className="bg-card-inner rounded-xl p-2.5 flex items-center justify-between border border-app">
                        <div className="flex flex-col">
                           <span className="text-[9px] text-tertiary mb-0.5">本月工时</span>
                           <span className="text-primary font-mono text-xs">{hoursThisMonth.toFixed(1)} <span className="text-[10px] text-tertiary">h</span></span>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400"><TrendingUp size={12} /></div>
                     </div>
                  </div>
               </div>
             </div>

             {/* Bottom row: Accumulated */}
             <div className="bg-card rounded-2xl p-3 border border-app flex items-center justify-between shadow-lg px-4">
                <span className="text-[11px] text-secondary">历史累计已赚 (估算)</span>
                <span className="text-primary font-mono text-sm tracking-tight">{sym} {hide(formatMoney((totalEarnedBeforeToday + earnedThisMonth) / ex))}</span>
             </div>
          </div>

          {/* 3. CURRENCY & VALUE CONVERSION */}
          <div className="px-4 md:px-8 py-2 mt-2 max-w-5xl mx-auto w-full">
             <div className="bg-card rounded-2xl p-3 border border-app flex flex-col shadow-lg">
                <div className="flex items-center justify-between mb-3">
                   <span className="text-[11px] text-secondary font-medium">今日收入换算 & 购买力</span>
                   <div className="text-[9px] bg-card-inner px-2 py-1 rounded flex items-center gap-1 text-tertiary border border-app">双币展示 <ChevronRight size={10} /></div>
                </div>
                
                <div className="grid grid-cols-2 gap-2 mb-3">
                   <div className="bg-card-inner rounded-xl p-3 border border-app flex flex-col items-center justify-center relative overflow-hidden">
                      <span className="text-[10px] text-tertiary mb-1 tracking-wider uppercase">人民币 (CNY)</span>
                      <span className="text-brand font-mono text-xl font-bold tracking-tight">¥{formatMoney(earnedToday)}</span>
                   </div>
                   <div className="bg-card-inner rounded-xl p-3 border border-app flex flex-col items-center justify-center relative overflow-hidden">
                      <span className="text-[10px] text-tertiary mb-1 tracking-wider uppercase">美元 (USD)</span>
                      <span className="text-brand/80 font-mono text-xl font-bold tracking-tight">${formatMoney(earnedToday / config.exchangeRateUsd)}</span>
                   </div>
                </div>

                <div className="flex overflow-x-auto no-scrollbar gap-2 pb-1">
                   <ConversionCard icon={<span className="text-xl filter drop-shadow-md">🧋</span>} label="奶茶" value={(earnedToday / MILK_TEA_PRICE).toFixed(1)} unit="杯" color="text-orange-300" />
                   <ConversionCard icon={<span className="text-xl filter drop-shadow-md">☕️</span>} label="咖啡" value={(earnedToday / COFFEE_PRICE).toFixed(1)} unit="杯" color="text-amber-400" />
                   <ConversionCard icon={<span className="text-xl filter drop-shadow-md">⛽️</span>} label="汽油" value={(earnedToday / GAS_PRICE).toFixed(1)} unit="L" color="text-red-400" />
                   <ConversionCard icon={<span className="text-xl filter drop-shadow-md">📱</span>} label="iPhone" value={((earnedToday / IPHONE_PRICE) * 100).toFixed(2)} unit="%" color="text-blue-300" />
                   <ConversionCard icon={<span className="text-xl filter drop-shadow-md">✨</span>} label={config.customItemName} value={(earnedToday / config.customItemPrice).toFixed(2)} unit="个" color="text-purple-400" />
                </div>
             </div>
          </div>

          {/* 4. COUNTDOWN SYSTEM (Horizontal Scroll) */}
          <div className="px-4 py-2">
             <div className="flex items-center justify-between mb-3 text-sm">
                <span className="text-primary font-medium">倒计时</span>
                <span className="text-xs text-tertiary cursor-pointer flex items-center">全部 <ChevronRight size={12} /></span>
             </div>
             
             <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 snaps-x">
                <CountdownCard 
                   title="下班倒计时"
                   time={`${pad0(Math.floor(offWorkSecs / 3600))}:${pad0(Math.floor((offWorkSecs % 3600)/60))}:${pad0(offWorkSecs % 60)}`}
                   desc={`${config.endTime}下班`}
                   progress={100 - (offWorkSecs / (config.hoursPerDay * 3600)) * 100}
                   icon={<Briefcase size={16} />}
                   color="green"
                />
                <CountdownCard 
                   title="距离休息日"
                   time={`${daysToWeekend} 天`}
                   desc="周末休息"
                   progress={100 - (daysToWeekend / 7) * 100}
                   icon={<CalendarIcon size={16} />}
                   color="yellow"
                />
                <CountdownCard 
                   title="距离发薪日"
                   time={`${daysToPayday} 天`}
                   desc={`${config.payday}号发薪`}
                   progress={100 - (daysToPayday / daysInMonth) * 100}
                   icon={<span className="text-sm">💰</span>}
                   color="amber"
                />
                <CountdownCard 
                   title={config.customEventName}
                   time={daysToCustom < 0 ? `已过去 ${Math.abs(daysToCustom)} 天` : `${daysToCustom} 天`}
                   desc={customDateObj.toLocaleDateString()}
                   progress={daysToCustom < 0 ? 100 : Math.max(0, 100 - (daysToCustom / 365) * 100)}
                   icon={<span className="text-sm">⭐</span>}
                   color="purple"
                />
                 <CountdownCard 
                   title="距离退休"
                   time={`${daysToRetire}天`}
                   desc={retireDateObj.toLocaleDateString()}
                   progress={daysToRetire < 0 ? 100 : Math.max(0, 100 - (daysToRetire / (365*30)) * 100)}
                   icon={<span className="text-sm">🪑</span>}
                   color="red"
                />
             </div>
          </div>

          {/* 5. SLACKING & OVERTIME COST */}
          <div className="px-4 py-2 mt-2 mb-8 flex flex-col gap-3">
             <div className="bg-card rounded-2xl p-4 border border-app flex items-center relative overflow-hidden shadow-lg">
                <div className="w-12 h-12 mr-3 relative z-10 flex items-center justify-center filter drop-shadow-lg text-4xl">🐟</div>
                
                <div className="flex-1 z-10">
                   <div className="flex items-center gap-1.5 mb-0.5">
                     <span className="text-xs text-primary font-medium">今日摸鱼</span>
                     <span className="text-lg font-mono font-bold text-brand">{Math.floor(slackSecondsToday / 60)}</span>
                     <span className="text-[10px] text-tertiary">分钟</span>
                     <button onClick={() => setSlackSecondsToday(0)} className="text-[9px] px-1.5 py-0.5 bg-card-inner border border-app rounded text-secondary hover:text-primary ml-1">归零</button>
                   </div>
                   <div className="text-[10px] text-tertiary font-mono">
                     ≈ 白赚 <span className="text-brand font-semibold text-[12px]">{sym}{hide(formatMoney(slackLoss / ex))}</span>
                   </div>
                </div>
                
                <button 
                  className={`z-10 ml-2 px-3 py-1.5 text-[11px] rounded-full border flex items-center gap-1 transition-colors ${
                    isSlacking ? 'bg-brand hover:opacity-90 text-app border-transparent' : 'bg-card-inner hover:bg-app text-primary border-app-strong'
                  }`}
                  onClick={() => setIsSlacking(!isSlacking)}
                >
                   {isSlacking ? '正在摸鱼中...' : '开始摸鱼'}
                </button>
             </div>

             <div className="bg-card rounded-2xl p-4 border border-red-500/20 flex items-center relative overflow-hidden shadow-lg">
                <div className="w-12 h-12 mr-3 relative z-10 flex items-center justify-center filter drop-shadow-lg text-4xl">🏢</div>
                
                <div className="flex-1 z-10">
                   <div className="flex items-center gap-1.5 mb-0.5">
                     <span className="text-xs text-red-500/80 font-medium">义务加班</span>
                     <span className="text-lg font-mono font-bold text-red-500">{Math.floor(overtimeSecondsToday / 60)}</span>
                     <span className="text-[10px] text-tertiary">分钟</span>
                     <button onClick={() => setOvertimeSecondsToday(0)} className="text-[9px] px-1.5 py-0.5 bg-red-500/10 rounded text-red-500 hover:bg-red-500/20 ml-1">归零</button>
                   </div>
                   <div className="text-[10px] text-tertiary font-mono">
                     ≈ 损失 <span className="text-red-500 font-semibold text-[12px]">{sym}{hide(formatMoney(overtimeLoss / ex))}</span>
                   </div>
                </div>
                
                <button 
                  className={`z-10 ml-2 px-3 py-1.5 text-[11px] rounded-full border flex items-center gap-1 transition-colors ${
                    isOvertime ? 'bg-red-500 hover:bg-red-600 text-primary border-transparent' : 'bg-card-inner hover:bg-app text-red-500/80 border-app-strong'
                  }`}
                  onClick={() => setIsOvertime(!isOvertime)}
                >
                   {isOvertime ? '正在加班中...' : '开始加班'}
                </button>
             </div>

             <div className="bg-card rounded-2xl p-4 border border-app shadow-lg relative overflow-hidden flex flex-col gap-2">
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 blur-3xl rounded-full"></div>
                <div className="flex items-center gap-2 mb-1 z-10">
                   <div className="w-6 h-6 rounded bg-purple-500/20 flex items-center justify-center text-xs">🤖</div>
                   <span className="text-xs text-purple-300 font-medium">一键生成摸鱼话术</span>
                </div>
                <div className="bg-card-inner p-3 rounded-xl border border-app min-h-[60px] text-[13px] text-primary z-10 font-medium leading-relaxed shadow-inner break-words">
                   "{excuse}"
                </div>
                <button 
                  onClick={generateExcuse}
                  className="w-full py-2.5 mt-1 rounded-xl bg-card-inner hover:bg-app border border-app text-[11px] text-secondary font-bold transition-colors z-10"
                >
                   换个借口被老板抓到了
                </button>
             </div>
          </div>
        </div>
      )}

      {activeTab === 'data' && (
        <div className="flex-1 overflow-y-auto no-scrollbar px-4 md:px-8 py-6 space-y-4 pb-24 max-w-5xl mx-auto w-full">
           <div className="flex items-center justify-between mb-4">
              <div>
                 <h2 className="text-xl font-bold text-primary mb-1">牛马数据中心</h2>
                 <p className="text-xs text-tertiary">掌握进度，合理规划摸鱼与离职时刻。</p>
              </div>
              <div className="flex items-center gap-2">
                 <button onClick={() => setShowUSD(!showUSD)} className={`text-[10px] px-2 py-1 rounded border transition-colors ${showUSD ? 'border-brand text-brand' : 'border-app-strong text-secondary hover:text-primary'}`}>USD</button>
                 <button onClick={() => setShowMoney(!showMoney)} className="text-secondary hover:text-primary p-1 rounded-full bg-card-inner border border-app">
                    {showMoney ? <Eye size={16} /> : <EyeOff size={16} />}
                 </button>
              </div>
           </div>
           
           <div className="bg-card rounded-2xl p-5 border border-app shadow-xl space-y-4 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-brand/5 blur-3xl rounded-full pointer-events-none"></div>
             
             <div>
                <h3 className="text-sm font-semibold text-primary">本月搞钱进度</h3>
                <div className="flex items-end gap-2 mt-2">
                   <span className="text-3xl font-mono text-brand font-bold tracking-tight">{sym} {hide(formatMoney(earnedThisMonth / ex))}</span>
                   <span className="text-xs text-tertiary mb-1.5 font-mono">/ {sym} {hide(formatMoney(config.monthlySalary / ex))}</span>
                </div>
                <div className="mt-3 h-2.5 bg-card-inner rounded-full overflow-hidden border border-app">
                   <div className="h-full bg-gradient-to-r from-teal-500 to-[#00FF41] rounded-full shadow-[0_0_10px_rgba(0,255,65,0.5)]" style={{ width: `${Math.min(100, (earnedThisMonth / config.monthlySalary) * 100)}%` }} />
                </div>
                <div className="flex justify-between text-[10px] text-tertiary mt-2 font-mono">
                   <span>已结算进度: {((earnedThisMonth / config.monthlySalary) * 100).toFixed(2)}%</span>
                   <span>剩余: {sym} {hide(formatMoney((config.monthlySalary - earnedThisMonth) / ex))}</span>
                </div>
             </div>

             <div className="grid grid-cols-2 gap-3 pt-3 border-t border-app relative z-10">
                <div className="bg-card-inner p-3 rounded-xl border border-app flex flex-col justify-center shadow-inner">
                   <div className="text-[10px] text-tertiary mb-1 flex items-center gap-1"><TrendingUp size={10} /> 历史总计总收入估算</div>
                   <div className="text-sm font-mono text-primary tracking-tight">{sym} {hide(formatMoney((totalEarnedBeforeToday + earnedThisMonth) / ex))}</div>
                </div>
                <div className="bg-card-inner p-3 rounded-xl border border-app flex flex-col justify-center shadow-inner">
                   <div className="text-[10px] text-tertiary mb-1 flex items-center gap-1"><Briefcase size={10} /> 累计奉献青春天数</div>
                   <div className="text-sm font-mono text-primary">{Math.floor(monthsWorked * currentMonthWorkDays + localTime.getDate())} 天</div>
                </div>
                <div className="bg-card-inner p-3 rounded-xl border border-brand/10 flex flex-col justify-center shadow-inner">
                   <div className="text-[10px] text-tertiary mb-1 flex items-center gap-1"><span className="text-[10px]">🐟</span> 本月累计摸鱼估值</div>
                   <div className="text-sm font-mono text-brand">{sym} {hide(formatMoney((slackLoss * (localTime.getDate() * 0.7)) / ex))}</div>
                </div>
                <div className="bg-card-inner p-3 rounded-xl border border-red-500/10 flex flex-col justify-center shadow-inner">
                   <div className="text-[10px] text-tertiary mb-1 flex items-center gap-1"><span className="text-[10px]">🏢</span> 本月累计义务加班损失</div>
                   <div className="text-sm font-mono text-red-500">{sym} {hide(formatMoney((overtimeLoss * (localTime.getDate() * 0.8)) / ex))}</div>
                </div>
             </div>
           </div>
        </div>
      )}

      {activeTab === 'profile' && (
        <div className="flex-1 overflow-y-auto no-scrollbar px-4 md:px-8 py-8 space-y-4 pb-24 max-w-5xl mx-auto w-full">
           <div className="flex items-center justify-between mb-2">
             <h2 className="text-xl font-bold text-primary">牛马设置中心</h2>
             
           </div>
           <p className="text-xs text-secondary mb-4">精准的参数才能算出精准的摸鱼收益。</p>
           <div className="bg-card rounded-2xl p-5 border border-app space-y-5 shadow-lg">
              <div>
                 <label className="text-xs text-secondary mb-1.5 block">每月税后薪资 (人民币)</label>
                 <input type="number" 
                   className="w-full appearance-none m-0 bg-card-inner border border-app-strong rounded-xl px-3 h-[44px] block box-border placeholder:text-secondary/50 text-brand font-mono text-base focus:border-brand focus:outline-none transition-colors"
                   value={config.monthlySalary}
                   onChange={e => setConfig({...config, monthlySalary: Number(e.target.value)})}
                 />
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="text-xs text-secondary mb-1.5 block">公共假期地区</label>
                    <select 
                      className="w-full appearance-none m-0 bg-card-inner border border-app-strong rounded-xl px-3 h-[44px] block box-border placeholder:text-secondary/50 text-primary text-base focus:border-brand focus:outline-none transition-colors"
                      value={config.holidayRegion}
                      onChange={e => setConfig({...config, holidayRegion: e.target.value})}
                    >
                      <option value="CN">🇨🇳 中国内地</option>
                      <option value="HK">🇭🇰 中国香港</option>
                      <option value="TH">🇹🇭 泰国</option>
                      <option value="VN">🇻🇳 越南</option>
                    </select>
                 </div>
                 <div>
                    <label className="text-xs text-secondary mb-1.5 block">休息日设置</label>
                    <select 
                      className="w-full appearance-none m-0 bg-card-inner border border-app-strong rounded-xl px-3 h-[44px] block box-border placeholder:text-secondary/50 text-primary text-base focus:border-brand focus:outline-none transition-colors"
                      value={config.restDays}
                      onChange={e => setConfig({...config, restDays: Number(e.target.value)})}
                    >
                      <option value={2}>双休 (周末)</option>
                      <option value={1}>单休 (周日)</option>
                    </select>
                 </div>
              </div>
              <div>
                 <label className="text-xs text-secondary mb-1.5 block">每日工作时长 (小时)</label>
                 <input type="number" step="0.5"
                   className="w-full appearance-none m-0 bg-card-inner border border-app-strong rounded-xl px-3 h-[44px] block box-border placeholder:text-secondary/50 text-primary font-mono text-base focus:border-brand focus:outline-none transition-colors"
                   value={config.hoursPerDay}
                   onChange={e => setConfig({...config, hoursPerDay: Number(e.target.value)})}
                 />
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="text-xs text-secondary mb-1.5 block">发薪日 (每月X号)</label>
                    <input type="number" 
                      className="w-full appearance-none m-0 bg-card-inner border border-app-strong rounded-xl px-3 h-[44px] block box-border placeholder:text-secondary/50 text-primary font-mono text-base focus:border-brand focus:outline-none transition-colors"
                      value={config.payday}
                      onChange={e => setConfig({...config, payday: Number(e.target.value)})}
                    />
                 </div>
                 <div>
                    <label className="text-xs text-secondary mb-1.5 block">入职时间</label>
                    <input type="date"
                      className="w-full appearance-none m-0 bg-card-inner border border-app-strong rounded-xl px-3 h-[44px] block box-border placeholder:text-secondary/50 text-primary font-mono text-base focus:border-brand focus:outline-none transition-colors"
                      value={config.joinDate}
                      onChange={e => setConfig({...config, joinDate: e.target.value})}
                    />
                 </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="text-xs text-secondary mb-1.5 block">首次发薪时间</label>
                    <input type="date"
                      className="w-full appearance-none m-0 bg-card-inner border border-app-strong rounded-xl px-3 h-[44px] block box-border placeholder:text-secondary/50 text-primary font-mono text-base focus:border-brand focus:outline-none transition-colors"
                      value={config.firstPayDate || config.joinDate}
                      onChange={e => setConfig({...config, firstPayDate: e.target.value})}
                    />
                 </div>
                 <div>
                    <label className="text-xs text-secondary mb-1.5 block">汇率 (USD/CNY)</label>
                    <input type="number" step="0.01"
                      className="w-full appearance-none m-0 bg-card-inner border border-app-strong rounded-xl px-3 h-[44px] block box-border placeholder:text-secondary/50 text-primary font-mono text-base focus:border-brand focus:outline-none transition-colors"
                      value={config.exchangeRateUsd}
                      onChange={e => setConfig({...config, exchangeRateUsd: Number(e.target.value)})}
                    />
                 </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="text-xs text-secondary mb-1.5 block">上班时间</label>
                    <input type="time"
                      className="w-full appearance-none m-0 bg-card-inner border border-app-strong rounded-xl px-3 h-[44px] block box-border placeholder:text-secondary/50 text-primary font-mono text-base focus:border-brand focus:outline-none transition-colors"
                      value={config.startTime}
                      onChange={e => setConfig({...config, startTime: e.target.value})}
                    />
                 </div>
                 <div>
                    <label className="text-xs text-secondary mb-1.5 block">下班时间</label>
                    <input type="time"
                      className="w-full appearance-none m-0 bg-card-inner border border-app-strong rounded-xl px-3 h-[44px] block box-border placeholder:text-secondary/50 text-primary font-mono text-base focus:border-brand focus:outline-none transition-colors"
                      value={config.endTime}
                      onChange={e => setConfig({...config, endTime: e.target.value})}
                    />
                 </div>
              </div>
              <div className="flex items-center justify-between pb-1 mt-4">
                 <span className="text-sm font-medium text-primary">是否有午休时长</span>
                 <button 
                   className={`w-12 h-6 rounded-full p-1 transition-colors relative ${config.hasLunchBreak ? 'bg-brand' : 'bg-gray-700'}`}
                   onClick={() => setConfig({...config, hasLunchBreak: !config.hasLunchBreak})}
                 >
                   <div className={`w-4 h-4 rounded-full bg-white transition-transform ${config.hasLunchBreak ? 'translate-x-6' : 'translate-x-0'}`}></div>
                 </button>
              </div>
              {config.hasLunchBreak && (
                <div className="grid grid-cols-2 gap-4">
                   <div>
                      <label className="text-xs text-secondary mb-1.5 block flex items-center gap-1"><span className="text-[10px]">🍚</span> 午休开始</label>
                      <input type="time"
                        className="w-full appearance-none m-0 bg-card-inner border border-app-strong rounded-xl px-3 h-[44px] block box-border placeholder:text-secondary/50 text-primary font-mono text-base focus:border-brand focus:outline-none transition-colors"
                        value={config.lunchStartTime}
                        onChange={e => setConfig({...config, lunchStartTime: e.target.value})}
                      />
                   </div>
                   <div>
                      <label className="text-xs text-secondary mb-1.5 block flex items-center gap-1"><span className="text-[10px]">💼</span> 午休结束</label>
                      <input type="time"
                        className="w-full appearance-none m-0 bg-card-inner border border-app-strong rounded-xl px-3 h-[44px] block box-border placeholder:text-secondary/50 text-primary font-mono text-base focus:border-brand focus:outline-none transition-colors"
                        value={config.lunchEndTime}
                        onChange={e => setConfig({...config, lunchEndTime: e.target.value})}
                      />
                   </div>
                </div>
              )}
              <hr className="border-app my-2" />
              <div>
                 <label className="text-xs text-secondary mb-1.5 block">自定义纪念日名称</label>
                 <input type="text"
                   className="w-full appearance-none m-0 bg-card-inner border border-app-strong rounded-xl px-3 h-[44px] block box-border placeholder:text-secondary/50 text-primary text-base focus:border-brand focus:outline-none transition-colors"
                   value={config.customEventName}
                   onChange={e => setConfig({...config, customEventName: e.target.value})}
                 />
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="text-xs text-secondary mb-1.5 block">纪念日日期</label>
                    <input type="date"
                      className="w-full appearance-none m-0 bg-card-inner border border-app-strong rounded-xl px-3 h-[44px] block box-border placeholder:text-secondary/50 text-primary font-mono text-base focus:border-brand focus:outline-none transition-colors"
                      value={config.customEventDate}
                      onChange={e => setConfig({...config, customEventDate: e.target.value})}
                    />
                 </div>
                 <div>
                    <label className="text-xs text-secondary mb-1.5 block">预期退休日期</label>
                    <input type="date"
                      className="w-full appearance-none m-0 bg-card-inner border border-app-strong rounded-xl px-3 h-[44px] block box-border placeholder:text-secondary/50 text-primary font-mono text-base focus:border-brand focus:outline-none transition-colors"
                      value={config.retirementDate}
                      onChange={e => setConfig({...config, retirementDate: e.target.value})}
                    />
                 </div>
              </div>
           </div>

           <div className="bg-card rounded-2xl p-5 md:p-8 lg:p-10 border border-app space-y-5 shadow-lg max-w-4xl mx-auto mb-4">
             
                 <div className="pt-4 border-t border-app-strong"></div>
                 <h3 className="text-sm font-bold text-primary mb-2">自定义购买力换算</h3>
                 <div className="grid grid-cols-2 gap-3">
                   <div>
                      <label className="text-xs text-secondary mb-1.5 block">自定义物品名称</label>
                      <input type="text" 
                        className="w-full appearance-none m-0 bg-card-inner border border-app-strong rounded-xl px-3 h-[44px] block box-border placeholder:text-secondary/50 text-primary text-base focus:border-brand focus:outline-none transition-colors"
                        value={config.customItemName}
                        onChange={e => setConfig({...config, customItemName: e.target.value})}
                      />
                   </div>
                   <div>
                      <label className="text-xs text-secondary mb-1.5 block">金额 (人民币)</label>
                      <input type="number" 
                        className="w-full appearance-none m-0 bg-card-inner border border-app-strong rounded-xl px-3 h-[44px] block box-border placeholder:text-secondary/50 text-brand font-mono text-base focus:border-brand focus:outline-none transition-colors"
                        value={config.customItemPrice}
                        onChange={e => setConfig({...config, customItemPrice: parseFloat(e.target.value) || 1})}
                      />
                   </div>
                 </div>

           </div>
           
           
           
           <div className="bg-card rounded-2xl p-5 border border-app space-y-4 shadow-lg mt-4">
              <h3 className="text-sm font-bold text-primary mb-2">配置方案保存</h3>
              <div className="flex gap-2 items-center">
                 <input type="text"
                   placeholder="输入方案名称，例如: 方案一线城市"
                   className="flex-1 appearance-none m-0 bg-card-inner border border-app-strong rounded-xl px-3 h-[44px] block box-border placeholder:text-secondary/50 text-primary text-base focus:border-brand focus:outline-none transition-colors"
                   value={currentProfileName}
                   onChange={e => setCurrentProfileName(e.target.value)}
                 />
                 <button 
                   onClick={() => {
                     if (!currentProfileName) return;
                     const newProfiles = [...profiles.filter(p => p.name !== currentProfileName), { name: currentProfileName, config: {...config} }];
                     setProfiles(newProfiles);
                     setCurrentProfileName('');
                   }}
                   className="px-4 py-2 bg-brand text-app font-bold rounded-xl whitespace-nowrap hover:bg-brand-hover"
                 >保存当前</button>
              </div>
              {profiles.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {profiles.map(p => (
                    <div key={p.name} className="flex items-center bg-card-inner border border-app rounded-full px-3 py-1 text-xs">
                       <span className="text-primary mr-2">{p.name}</span>
                       <button onClick={() => setConfig(p.config)} className="text-brand hover:underline mr-2">载入</button>
                       <button onClick={() => setProfiles(profiles.filter(x => x.name !== p.name))} className="text-red-500 hover:underline">删除</button>
                    </div>
                  ))}
                </div>
              )}
           </div>

           <div className="bg-card rounded-2xl p-5 md:p-8 lg:p-10 border border-brand/20 max-w-4xl mx-auto mt-4">
              <h3 className="text-xs text-brand font-bold mb-3 uppercase tracking-wider">实时时薪预估</h3>
              <div className="flex justify-between items-center text-sm mb-1">
                 <span className="text-secondary">时薪:</span>
                 <span className="text-primary font-mono">¥ {hourlyRate.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                 <span className="text-secondary">分钟薪:</span>
                 <span className="text-primary font-mono">¥ {minuteRate.toFixed(2)}</span>
              </div>
           </div>
        </div>
      )}

      {activeTab === 'calendar' && (
        <div className="flex-1 overflow-y-auto no-scrollbar px-4 md:px-8 py-8 space-y-4 pb-24 absolute inset-0 top-0 bg-card-inner z-40 md:rounded-3xl max-w-4xl mx-auto w-full">
           <div className="flex items-center justify-between mt-2 mb-2">
              <button onClick={() => setActiveTab('home')} className="p-2 bg-card rounded-full border border-app text-primary">
                 <ChevronLeft size={18} />
              </button>
              <span className="font-bold text-primary">牛马工作日历</span>
              <div className="flex gap-2">
                 <button onClick={() => setCalendarDate(new Date())} className="px-3 py-1 bg-card rounded-full border border-app text-xs text-primary">
                    今
                 </button>
              </div>
           </div>

           <div className="bg-card rounded-2xl p-3 border border-app flex items-center justify-between shadow-lg">
              <button 
                onClick={() => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1, 1))} 
                className="p-2 bg-card-inner rounded-full border border-app text-brand hover:bg-app"
              ><ChevronLeft size={16} /></button>
              <div className="text-center">
                 <div className="text-lg font-bold text-primary">{calendarDate.getFullYear()}年{calendarDate.getMonth() + 1}月</div>
                 <div className="text-[10px] text-tertiary">(本月基础薪资 {sym}{hide(formatMoney(config.monthlySalary / ex))})</div>
              </div>
              <button 
                 onClick={() => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 1))} 
                 className="p-2 bg-card-inner rounded-full border border-app text-brand hover:bg-app"
              ><ChevronRight size={16} /></button>
           </div>

           {/* Dynamic Month Data Calculation */}
           {(() => {
              const isPastMonth = calendarDate.getFullYear() < localTime.getFullYear() || (calendarDate.getFullYear() === localTime.getFullYear() && calendarDate.getMonth() < localTime.getMonth());
              const isFutureMonth = calendarDate.getFullYear() > localTime.getFullYear() || (calendarDate.getFullYear() === localTime.getFullYear() && calendarDate.getMonth() > localTime.getMonth());
              
              let calEarned = 0;
              let calHours = 0;
              let calSlack = 0;
              let calOvertime = 0;
              
              if (isPastMonth) {
                 calEarned = config.monthlySalary;
                 calHours = currentMonthWorkDays * config.hoursPerDay;
                 // Dummy estimate for past months since we don't have a DB
                 calSlack = (slackLoss / localTime.getDate()) * currentMonthWorkDays;
                 calOvertime = (overtimeLoss / localTime.getDate()) * currentMonthWorkDays;
              } else if (isFutureMonth) {
                 calEarned = 0;
                 calHours = 0;
                 calSlack = 0;
                 calOvertime = 0;
              } else {
                 calEarned = earnedThisMonth;
                 calHours = hoursThisMonth;
                 calSlack = slackLoss * (localTime.getDate() * 0.7);
                 calOvertime = overtimeLoss * (localTime.getDate() * 0.8);
              }
              
              return (
                <div className="bg-card rounded-2xl p-4 border border-app grid grid-cols-2 gap-3 shadow-lg relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-brand/5 blur-3xl rounded-full"></div>
                  
                  <div className="flex flex-col bg-card-inner p-3 rounded-xl border border-app justify-center mt-1">
                     <span className="text-[10px] text-tertiary mb-1 flex items-center gap-1"><TrendingUp size={10} /> 当月总收入</span>
                     <span className="text-lg font-mono font-bold text-brand">{sym}{hide(formatMoney(calEarned / ex))}</span>
                  </div>
                  <div className="flex flex-col bg-card-inner p-3 rounded-xl border border-app justify-center mt-1">
                     <span className="text-[10px] text-tertiary mb-1 flex items-center gap-1"><span className="text-[10px]">⏱️</span> 当月总工时</span>
                     <span className="text-lg font-mono font-bold text-brand">{calHours.toFixed(1)} <span className="text-[10px] text-tertiary font-sans">小时</span></span>
                  </div>

                  <div className="flex flex-col bg-card-inner p-3 rounded-xl border border-brand/10 justify-center">
                     <span className="text-[10px] text-tertiary mb-1 flex items-center gap-1"><span className="text-[10px]">🐟</span> 月度摸鱼估值</span>
                     <span className="text-sm font-mono font-bold text-brand">{sym}{hide(formatMoney(calSlack / ex))}</span>
                  </div>
                  <div className="flex flex-col bg-card-inner p-3 rounded-xl border border-red-500/10 justify-center">
                     <span className="text-[10px] text-tertiary mb-1 flex items-center gap-1"><span className="text-[10px]">🏢</span> 月度加班损失</span>
                     <span className="text-sm font-mono font-bold text-red-500">{sym}{hide(formatMoney(calOvertime / ex))}</span>
                  </div>
                </div>
              );
           })()}

           <div className="bg-card rounded-2xl p-4 border border-app shadow-lg relative overflow-hidden">
              <div className="grid grid-cols-7 gap-1 text-center mb-2">
                 {['日','一','二','三','四','五','六'].map(d => (
                    <div key={d} className="text-[13px] text-tertiary font-bold py-1">{d}</div>
                 ))}
              </div>
              <div className="grid grid-cols-7 gap-1 text-center">
                 {Array.from({length: new Date(calendarDate.getFullYear(), calendarDate.getMonth(), 1).getDay()}).map((_, i) => (
                    <div key={`empty-${i}`} className="h-14 border border-transparent"></div>
                 ))}
                 {Array.from({length: new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 0).getDate()}).map((_, i) => {
                    const date = i + 1;
                    const d = new Date(calendarDate.getFullYear(), calendarDate.getMonth(), date);
                    const dayOfWeek = d.getDay();
                    let isRest = config.restDays === 2 ? (dayOfWeek === 0 || dayOfWeek === 6) : (dayOfWeek === 0);
                    
                    const hd = new Holidays(config.holidayRegion);
                    const h = hd.isHoliday(d);
                    const isPublic = h && h.some((x: any) => x.type === 'public');
                    
                    let label = '上班';
                    let holidayName = '';
                    if (isPublic) {
                       isRest = true;
                       label = '假期';
                       holidayName = h.find((x: any) => x.type === 'public')?.name || h[0].name;
                    } else if (isRest) {
                       label = '休息';
                    }
                    
                    const isToday = date === localTime.getDate() && calendarDate.getMonth() === localTime.getMonth() && calendarDate.getFullYear() === localTime.getFullYear();
                    
                    return (
                       <div key={date} className={`h-14 flex flex-col items-center justify-center rounded-lg border transition-all cursor-pointer hover:scale-[1.02] overflow-hidden ${
                          isToday ? 'bg-brand/20 border-brand shadow-md relative' : 
                          isRest ? 'bg-card border-transparent' : 'bg-card-inner border-app shadow-sm'
                       }`}>
                          {isToday && <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-app"></div>}
                          <span className={`text-[15px] font-bold mb-0.5 ${isToday ? 'text-primary' : (isRest?'text-secondary':'text-primary')}`}>{date}</span>
                          {holidayName ? (
                            <span className="text-[7px] text-[#ff6f51] leading-tight text-center truncate px-0.5 w-full">{holidayName}</span>
                          ) : (
                            <span className={`text-[9px] ${isToday ? 'text-primary/90' : (isRest ? 'text-orange-400' : 'text-brand')}`}>{label}</span>
                          )}
                       </div>
                    )
                 })}
              </div>
              <div className="text-center mt-5 text-[11px] text-tertiary">
                 提示：双击日期可切换工作日/休息日状态
              </div>
           </div>
        </div>
      )}

      {activeTab !== 'home' && activeTab !== 'profile' && activeTab !== 'data' && activeTab !== 'calendar' && (
        <div className="flex-1 flex flex-col items-center justify-center pb-24 text-tertiary">
           <div className="text-5xl mb-3 filter drop-shadow-md">🚧</div>
           <p className="text-sm">功能正在开发中...</p>
           <p className="text-xs text-gray-600 mt-1">Please come back later</p>
        </div>
      )}

      {/* BOTTOM NAV BAR */}
      <div className="fixed bottom-0 left-0 right-0 w-full md:max-w-4xl lg:max-w-6xl xl:max-w-[1400px] mx-auto bg-card-inner/90 backdrop-blur-lg border-t md:border border-app py-3 md:py-4 px-6 md:px-24 flex justify-between items-center z-50 md:rounded-b-3xl md:rounded-t-none md:bottom-4 xl:rounded-3xl shadow-2xl md:mb-4 xl:mb-0 transition-all duration-300">
         <NavItem icon={<Home size={24} />} label="首页" active={activeTab === 'home'} onClick={() => setActiveTab('home')} />
         <NavItem icon={<CalendarIcon size={24} />} label="日历" active={activeTab === 'calendar'} onClick={() => { setActiveTab('calendar'); setCalendarDate(new Date()); }} />
         <NavItem icon={<PieChart size={24} />} label="数据" active={activeTab === 'data'} onClick={() => setActiveTab('data')} />
         <NavItem icon={<Settings size={24} />} label="设定" active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} />
      </div>
      
    </div>
  );
}

// --- SUB-COMPONENTS ---

function MenuIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="6" x2="21" y2="6"></line>
      <line x1="3" y1="12" x2="21" y2="12"></line>
      <line x1="3" y1="18" x2="21" y2="18"></line>
    </svg>
  );
}

function ConversionCard({ icon, label, value, unit, color, className = '' }: { icon: React.ReactNode, label: string, value: string, unit: string, color: string, className?: string }) {
  return (
    <div className={`bg-card-inner border border-app rounded-lg p-1.5 flex flex-col items-center justify-center relative overflow-hidden group min-w-0 h-[60px] shrink-0 w-[72px] ${className}`}>
      <div className="flex items-center gap-1 mb-0.5">
        <div className="transition-transform group-hover:scale-110 duration-300">{icon}</div>
        <div className="text-[9px] text-secondary truncate">{label}</div>
      </div>
      <div className="flex items-baseline gap-0.5 text-center px-1">
        <span className={`text-[11px] font-mono font-semibold ${color} truncate`}>{value}</span>
        <span className="text-[8px] text-tertiary shrink-0">{unit}</span>
      </div>
    </div>
  );
}

const colorMap = {
  green: { bg: 'bg-brand/10', text: 'text-brand', border: 'border-brand/20', bar: 'bg-brand shadow-[0_0_8px_rgba(0,255,65,0.4)]' },
  yellow: { bg: 'bg-yellow-500/10', text: 'text-yellow-500', border: 'border-yellow-500/20', bar: 'bg-yellow-500' },
  amber: { bg: 'bg-amber-500/10', text: 'text-amber-500', border: 'border-amber-500/20', bar: 'bg-amber-500' },
  purple: { bg: 'bg-purple-500/10', text: 'text-purple-500', border: 'border-purple-500/20', bar: 'bg-purple-500' },
  red: { bg: 'bg-red-500/10', text: 'text-red-500', border: 'border-red-500/20', bar: 'bg-red-500' },
};

function CountdownCard({ title, time, desc, progress, icon, color }: { title: string, time: string, desc: string, progress: number, icon: React.ReactNode, color: keyof typeof colorMap }) {
  const styles = colorMap[color];
  const w = Math.max(0, Math.min(100, progress));
  
  return (
    <div className={`min-w-[124px] snap-center bg-card border border-app rounded-2xl p-3 flex flex-col relative`}>
       <div className={`w-10 h-10 rounded-xl mb-3 flex items-center justify-center ${styles.bg} ${styles.text}`}>
          {icon}
       </div>
       <div className="text-[10px] text-secondary mb-1">{title}</div>
       <div className={`text-xl font-mono font-semibold mb-0.5 tracking-tight ${styles.text}`}>{time}</div>
       <div className="text-[9px] text-tertiary mb-4">{desc}</div>
       
       <div className="absolute bottom-3 left-3 right-3 flex items-center gap-1.5">
          <div className="flex-1 h-1.5 bg-card-inner border border-app rounded-full overflow-hidden">
             <div className={`h-full ${styles.bar} rounded-full`} style={{ width: `${w}%` }} />
          </div>
          <span className="text-[8px] text-tertiary font-mono w-4 text-right">{Math.round(w)}%</span>
       </div>
    </div>
  );
}

function NavItem({ icon, label, active = false, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick?: () => void }) {
  return (
    <div className={`flex flex-col items-center justify-center cursor-pointer gap-1 p-1`} onClick={onClick}>
       <div className={`${active ? 'text-brand' : 'text-tertiary'} transition-colors`}>
         {icon}
       </div>
       <div className={`text-[10px] ${active ? 'text-brand font-bold' : 'text-tertiary'}`}>
         {label}
       </div>
    </div>
  );
}

