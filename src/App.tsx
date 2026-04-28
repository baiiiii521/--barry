import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Solar } from 'lunar-javascript';
import Holidays from 'date-holidays';
import html2canvas from 'html2canvas';

const playAlertSound = (type: string) => {
  if (!type || type === 'none') return;
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const audioCtx = new AudioContextClass();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    if (type === 'beep') {
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(800, audioCtx.currentTime);
      gainNode.gain.setValueAtTime(0.5, audioCtx.currentTime);
      oscillator.start();
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
      oscillator.stop(audioCtx.currentTime + 0.3);
    } else if (type === 'bell') {
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(600, audioCtx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(300, audioCtx.currentTime + 1.5);
      gainNode.gain.setValueAtTime(0.7, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 1.5);
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 1.5);
    } else if (type === 'chime') {
      oscillator.type = 'triangle';
      oscillator.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
      oscillator.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.2); // E5
      gainNode.gain.setValueAtTime(0.5, audioCtx.currentTime);
      gainNode.gain.setValueAtTime(0.5, audioCtx.currentTime + 0.2);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.8);
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 1.0);
    } else if (type === 'digital') {
      oscillator.type = 'square';
      oscillator.frequency.setValueAtTime(440, audioCtx.currentTime);
      oscillator.frequency.setValueAtTime(880, audioCtx.currentTime + 0.1);
      gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.3);
    }
  } catch (e) {
    console.error("Audio playback failed", e);
  }
};

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
  Clock, // Pomodoro icon
  Timer, // Better Pomodoro icon
  Plus,  // Memo
  Trash2, // Memo delete
  Edit2,  // Memo edit
  CheckCircle,
  X,
  Play,
  Pause,
  Square
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
  return workdays || 21.75;
};

const MemoItems = React.memo(({ 
  memos, 
  onToggle, 
  onDelete 
}: { 
  memos: any[], 
  onToggle: (idx: number) => void, 
  onDelete: (idx: number) => void 
}) => {
  if (memos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <div className="w-20 h-20 bg-brand/5 rounded-3xl flex items-center justify-center text-brand/20 border border-brand/10 border-dashed animate-pulse">
          <Plus size={40} />
        </div>
        <div>
          <p className="text-primary font-bold text-lg tracking-tight">今日无事</p>
          <p className="text-secondary text-sm mt-1 max-w-[200px] mx-auto opacity-70">勾勒你的今日牛马计划，让时间更有分量。</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {memos.map((memo, idx) => (
        <motion.div 
          layout
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          key={memo.id} 
          className={`group flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 ${
            memo.completed 
              ? 'bg-card-inner/30 border-app opacity-40 grayscale' 
              : 'bg-card border-app shadow-sm hover:border-brand/40 hover:shadow-md'
          }`}
        >
           <div className="flex items-center gap-4 flex-1 overflow-hidden" onClick={() => onToggle(idx)}>
              <div className={`shrink-0 transition-transform duration-300 transform ${memo.completed ? 'scale-110 text-brand' : 'text-tertiary group-hover:scale-110'}`}>
                 <CheckCircle size={22} fill={memo.completed ? "currentColor" : "none"} strokeWidth={1.5} />
              </div>
              <span className={`text-[15px] font-medium truncate py-0.5 select-none ${memo.completed ? 'line-through text-secondary' : 'text-primary'}`}>
                {memo.text}
              </span>
           </div>
           <button 
             onClick={(e) => { e.stopPropagation(); onDelete(idx); }} 
             className="text-red-400 hover:text-red-500 hover:bg-red-500/10 p-2 rounded-xl transition-all"
           >
              <Trash2 size={18} />
           </button>
        </motion.div>
      ))}
    </div>
  );
});

const MemoModal = React.memo(({ 
  date, 
  memos, 
  onClose, 
  onSave 
}: { 
  date: string, 
  memos: any[], 
  onClose: () => void, 
  onSave: (date: string, updatedMemos: any[]) => void 
}) => {
  const [localMemos, setLocalMemos] = useState(memos);
  const [text, setText] = useState("");
  
  // Update local state when source memos change (if modal stays open)
  useEffect(() => {
    setLocalMemos(memos);
  }, [memos]);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    const newMemo = { id: Math.random().toString(), text: text.trim(), completed: false };
    const updated = [...localMemos, newMemo];
    setLocalMemos(updated);
    onSave(date, updated);
    setText("");
  };

  const toggleMemo = useCallback((idx: number) => {
    setLocalMemos(prev => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], completed: !updated[idx].completed };
      onSave(date, updated);
      return updated;
    });
  }, [date, onSave]);

  const deleteMemo = useCallback((idx: number) => {
    setLocalMemos(prev => {
      const updated = [...prev];
      updated.splice(idx, 1);
      onSave(date, updated);
      return updated;
    });
  }, [date, onSave]);

  return (
    <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-black/50 backdrop-blur-md px-0 md:px-4">
      <motion.div 
        initial={{ y: "100%", opacity: 0 }} 
        animate={{ y: 0, opacity: 1 }} 
        exit={{ y: "100%", opacity: 0 }}
        className="bg-card w-full max-w-lg rounded-t-[32px] md:rounded-[32px] shadow-2xl border-t md:border border-app overflow-hidden flex flex-col max-h-[90vh] md:max-h-[80vh] relative"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand/5 blur-3xl rounded-full pointer-events-none" />
        
        <div className="p-6 border-b border-app flex items-center justify-between bg-card-inner relative z-10">
          <div className="flex flex-col">
            <h3 className="text-xl font-bold text-primary tracking-tight flex items-center gap-2">
              <div className="w-2 h-6 bg-brand rounded-full"></div>
              备忘清单
            </h3>
            <p className="text-xs text-secondary font-mono mt-0.5 opacity-70">{date}</p>
          </div>
          <button onClick={onClose} className="p-3 bg-card border border-app rounded-2xl text-secondary hover:bg-app hover:text-primary transition-all active:scale-90 shadow-sm border-dashed">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 flex-1 overflow-y-auto space-y-4 no-scrollbar relative z-10 min-h-[300px]">
          <MemoItems 
            memos={localMemos} 
            onToggle={toggleMemo} 
            onDelete={deleteMemo} 
          />
        </div>

        <div className="p-6 bg-card-inner border-t border-app relative z-10">
          <form onSubmit={handleAdd} className="flex gap-3">
            <div className="flex-1 relative">
              <input 
                type="text" 
                autoFocus
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="键入待办事项..." 
                className="w-full bg-card border border-app rounded-2xl px-5 py-4 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand shadow-inner text-primary placeholder:text-tertiary transition-all"
              />
            </div>
            <button 
              type="submit" 
              disabled={!text.trim()}
              className="bg-brand text-card w-14 h-14 rounded-2xl flex items-center justify-center hover:bg-brand-hover active:scale-90 transition-all shadow-lg shadow-brand/20 disabled:opacity-50 disabled:grayscale"
            >
              <Plus size={24} strokeWidth={3} />
            </button>
          </form>
          <div className="flex items-center justify-center gap-2 mt-4 opacity-40">
             <div className="h-[1px] w-8 bg-tertiary"></div>
             <span className="text-[10px] text-tertiary font-medium uppercase tracking-[0.1em]">Local Storage Only</span>
             <div className="h-[1px] w-8 bg-tertiary"></div>
          </div>
        </div>
      </motion.div>
    </div>
  );
});

// Extracted Calendar Grid for performance
const CalendarGrid = React.memo(({ 
  calendarDate, 
  localTime, 
  config, 
  memos, 
  onDateClick 
}: { 
  calendarDate: Date, 
  localTime: Date, 
  config: any, 
  memos: any, 
  onDateClick: (key: string) => void 
}) => {
  const hd = useMemo(() => new Holidays(config?.holidayRegion || 'CN'), [config?.holidayRegion]);
  
  const daysInMonth = new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 0).getDate();
  const startDay = new Date(calendarDate.getFullYear(), calendarDate.getMonth(), 1).getDay();
  
  const cells = [];
  // Empty cells
  for (let i = 0; i < startDay; i++) {
    cells.push(<div key={`empty-${i}`} className="h-16 md:h-20 border border-transparent"></div>);
  }
  
  // Day cells
  for (let date = 1; date <= daysInMonth; date++) {
    const d = new Date(calendarDate.getFullYear(), calendarDate.getMonth(), date);
    const dayOfWeek = d.getDay();
    let isRest = config.restDays === 2 ? (dayOfWeek === 0 || dayOfWeek === 6) : (dayOfWeek === 0);
    
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
    const memoKey = `${calendarDate.getFullYear()}-${(calendarDate.getMonth() + 1).toString().padStart(2, '0')}-${date.toString().padStart(2, '0')}`;
    const dayMemos = (memos || {})[memoKey] || [];
    const completedCount = dayMemos.filter((m: any) => m.completed).length;
    
    cells.push(
      <motion.div 
        key={date} 
        whileTap={{ scale: 0.95 }}
        onClick={() => onDateClick(memoKey)}
        className={`h-16 md:h-20 flex flex-col items-center justify-center rounded-2xl border transition-all cursor-pointer relative overflow-hidden group ${
          isToday ? 'bg-brand/10 border-brand shadow-[0_0_15px_rgba(0,255,65,0.2)] z-10' : 
          isRest ? 'bg-card border-transparent text-secondary/60' : 'bg-card-inner border-app shadow-sm hover:border-brand/30'
        }`}
      >
        {isToday && <div className="absolute top-2 right-2 w-2 h-2 bg-brand rounded-full animate-pulse shadow-[0_0_8px_rgba(0,255,65,0.8)]"></div>}
        
        {dayMemos.length > 0 && (
          <div className="absolute top-2 left-2 flex gap-0.5">
            {dayMemos.slice(0, 3).map((m: any, idx: number) => (
              <div key={idx} className={`w-1.5 h-1.5 rounded-full transition-colors ${m.completed ? 'bg-brand/30' : 'bg-brand shadow-[0_0_4px_rgba(0,255,65,0.5)]'}`}></div>
            ))}
            {dayMemos.length > 3 && <div className="w-1 h-1 rounded-full bg-brand/20"></div>}
          </div>
        )}
        
        <span className={`text-base md:text-xl font-bold mb-0.5 transition-colors group-hover:text-brand ${isToday ? 'text-primary' : 'text-primary'}`}>{date}</span>
        
        {holidayName ? (
          <span className="text-[8px] md:text-[10px] text-orange-500 font-bold leading-tight text-center truncate px-1 w-full bg-orange-500/10 rounded-md border border-orange-500/20">{holidayName}</span>
        ) : (
          <div className="flex items-center gap-1">
             <span className={`text-[9px] md:text-[11px] font-medium ${isToday ? 'text-brand' : (isRest ? 'text-secondary/50' : 'text-tertiary')}`}>{label}</span>
             {dayMemos.length > 0 && completedCount === dayMemos.length && <span className="text-[10px]">✅</span>}
          </div>
        )}
      </motion.div>
    );
  }
  
  return (
    <div className="grid grid-cols-7 gap-2 text-center">
      {cells}
    </div>
  );
});

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
    const defaultConfig = {
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
      customEvents: [{ id: '1', name: '纪念日', date: '2022-01-01', color: 'purple' }],
      retirementDate: '2050-01-01',
      otherTimezone: 'Asia/Ho_Chi_Minh',
      otherTimezoneLabel: '胡志明',
      localTimezone: initialTz.value,
      localTimezoneLabel: initialTz.label,
      customItemName: '自定义', 
      customItemPrice: 100,
      pomodoroStartSound: 'none',
      pomodoroEndSound: 'bell',
      pomodoroBreakSound: 'chime',
    };
    try {
      const savedConfig = localStorage.getItem('niuma_config');
      if (savedConfig) {
        const parsed = JSON.parse(savedConfig);
        const merged = { ...defaultConfig, ...(parsed || {}) };
        if (!merged.customEvents && merged.customEventName) {
          merged.customEvents = [{ id: Math.random().toString(), name: merged.customEventName, date: merged.customEventDate || '2000-01-01', color: 'purple' }];
        }
        return merged;
      }
    } catch(e) {}
    return defaultConfig;
  });
  
  useEffect(() => {
    localStorage.setItem('niuma_config', JSON.stringify(config));
  }, [config]);




  // === Pomodoro State ===
  const [pomodoroLength, setPomodoroLength] = useState(25); // in minutes
  const [pomodoroTimeLeft, setPomodoroTimeLeft] = useState(25 * 60); // in seconds
  const [isPomodoroActive, setIsPomodoroActive] = useState(false);
  const [pomodoroTask, setPomodoroTask] = useState("");
  const [completedPomodoros, setCompletedPomodoros] = useState(0);

  // === Reminder State ===
  const [reminderText, setReminderText] = useState('该摸一会儿鱼了，休息一下！');
  const [reminderMins, setReminderMins] = useState(30);
  const [isReminderActive, setIsReminderActive] = useState(false);
  const [reminderTimeLeft, setReminderTimeLeft] = useState(30 * 60);

  // === Refs for Background Ticking ===
  const pomodoroTimeLeftRef = useRef(pomodoroTimeLeft);
  pomodoroTimeLeftRef.current = pomodoroTimeLeft;
  const isPomodoroActiveRef = useRef(isPomodoroActive);
  isPomodoroActiveRef.current = isPomodoroActive;
  
  const reminderTimeLeftRef = useRef(reminderTimeLeft);
  reminderTimeLeftRef.current = reminderTimeLeft;
  const isReminderActiveRef = useRef(isReminderActive);
  isReminderActiveRef.current = isReminderActive;
  const reminderMinsRef = useRef(reminderMins);
  reminderMinsRef.current = reminderMins;
  const reminderTextRef = useRef(reminderText);
  reminderTextRef.current = reminderText;

  const togglePomodoro = () => {
    if (!isPomodoroActive && 'Notification' in window && Notification.permission === "default") {
       Notification.requestPermission().catch(()=>{});
    }
    if (!isPomodoroActive) {
      playAlertSound(config.pomodoroStartSound);
    }
    setIsPomodoroActive(!isPomodoroActive);
  };

  const resetPomodoro = () => {
    setIsPomodoroActive(false);
    setPomodoroTimeLeft(pomodoroLength * 60);
  };
  
  const handlePomodoroLengthChange = (mins) => {
     setPomodoroLength(mins);
     setPomodoroTimeLeft(mins * 60);
     setIsPomodoroActive(false);
  };

  // === Memo State ===
  const [memos, setMemos] = useState(() => {
    try {
      const saved = localStorage.getItem('niuma_memos');
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed || {};
      }
    } catch(e) {}
    return {};
  });

  useEffect(() => {
    localStorage.setItem('niuma_memos', JSON.stringify(memos));
  }, [memos]);

  const [selectedMemoDate, setSelectedMemoDate] = useState(null);

  const [activeTab, setActiveTab] = useState('home');
  const [showAllCountdowns, setShowAllCountdowns] = useState(false);
  const [conversionTimeframe, setConversionTimeframe] = useState<'today'|'month'|'year'>('today');
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareImgUrl, setShareImgUrl] = useState('');
  const shareRef = useRef<HTMLDivElement>(null);
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [now, setNow] = useState(new Date());
  
  const localTime = new Date(now.toLocaleString("en-US", {timeZone: config.localTimezone}));
  
  const generateShareImage = async () => {
    if (!shareRef.current) return;
    try {
      const canvas = await html2canvas(shareRef.current, { backgroundColor: null, scale: 2 });
      setShareImgUrl(canvas.toDataURL('image/png'));
      setShowShareModal(true);
    } catch (err) {
      console.error('Failed to generate sharing image:', err);
    }
  };
  
  // Dynamic average work days calculated to represent 'hourly rate' today. Let's use the current month for calculation.
  const currentMonthWorkDays = useMemo(() => {
    return getWorkDaysInMonth(localTime.getFullYear(), localTime.getMonth(), config.holidayRegion, config.restDays);
  }, [localTime.getFullYear(), localTime.getMonth(), config.holidayRegion, config.restDays]);

  const hourlyRate = config.monthlySalary / (currentMonthWorkDays * config.hoursPerDay);
  const minuteRate = hourlyRate / 60;
  const secondRate = minuteRate / 60;

  const [isSlacking, setIsSlacking] = useState(false);
  const [toast, setToast] = useState<{message: string, type: 'info'|'warn'}|null>(null);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleMemoModalClose = useCallback(() => {
    setSelectedMemoDate(null);
  }, []);

  const handleMemoModalSave = useCallback((date: string, updatedMemos: any[]) => {
    setMemos(prev => ({
      ...prev,
      [date]: updatedMemos
    }));
  }, []);

  const handleDateClick = useCallback((key: string) => {
    setSelectedMemoDate(key);
  }, []);
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
      "本地环境崩了，正在重新配，太难了！",
      "刚才在尝试通过量子纠缠的方式远程修复Bug。",
      "我在观察办公室的空气动力学，为了提高工位效率。",
      "正在深度思考Carbon在未来的地位。",
      "其实我是在做深度呼吸训练，以此降低服务器的碳排放。",
      "刚才那个姿势是在模仿罗丹的‘思考者’，试图获得哲学加持。",
      "我发现代码里有一个逻辑漏洞，正在脑海中跑虚拟机测试。",
      "正在计算公司上市后我手里的期权能买几斤猪肉。",
      "老板，我正在用意念与服务器进行底层协议握手。",
      "这不叫迟到，这叫‘分布式时差办公’。",
      "我在研究黑洞，因为我感觉我的逻辑被吞噬了。",
      "刚才是幻觉，我刚才其实在另一个平行宇宙已经写完需求了。",
      "我在测试鼠标垫的摩擦系数，确保拖动代码时的极致丝滑。",
      "刚才那个眼神是在扫描办公室的安全漏洞。",
      "正在等待宇宙射线的干扰消失，否则代码会产生位翻转。",
      "我在通过心跳频率判断代码的运行效率。",
      "刚才闭眼是在跟AI贾维斯灵魂沟通。",
      "这不叫偷懒，这叫给CPU降频以延长企业资产寿命。",
      "我正在进行语义分析，试图理解产品经理那句‘简单改下’背后的含义。",
      "我在跟桌上的橡皮鸭解释为何这段代码它就是跑不通。",
      "正在等咖啡机的进度条，那才是我的生命值进度条。",
      "刚才是在测试办公室的隔音效果。",
      "我在思考如果人类灭绝了，这段代码还能不能继续运行下去。",
      "我在进行‘离散数学交互演习’。",
      "刚才那个哈欠是在排出大脑多余的冗余数据。",
      "老板，我在给代码做心理辅导，它最近有点抗拒生产环境。",
      "我在研究如何用5G信号控制我的午餐外卖。",
      "刚才低头是在感叹人生如戏，全是Bug。",
      "我在寻找代码中的‘艺术感’。",
      "正在进行高强度的脑机接口测试。",
      "这叫‘内省式开发’，在安静中寻找逻辑的真谛。",
      "我在为下个季度的KPI提前担忧，导致焦虑性停工。",
      "正在试图用‘原力’修复那段该死的旧代码。",
      "老板，我正在试图突破由于过度工作造成的维度障壁。",
      "我在思考如何把这个项目做成元宇宙模式。",
      "刚才其实是在对代码进行‘无声的抗议’。",
      "我在估算如果我现在跳槽，公司的损失会有多大。",
      "我在试图理解人类存在的意义，顺便写个Hello World。",
      "我在跟空调的风向进行斗争。",
      "正在跟自己的影子对需求。",
      "刚才是灵魂出窍，去巡查了一下机房。",
      "我在练习如何用眼神杀掉一个Bug。",
      "这叫‘意识流编码’，我正在积攒流量。"
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

  const isLunchBreak = config.hasLunchBreak && nowSecs >= lunchStartSecs && nowSecs < lunchEndSecs;
  const isCurrentlyWorkingTime = !isRestDay && nowSecs >= startSecs && nowSecs < endSecs && !isLunchBreak;

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

  const workerRef = useRef<Worker | null>(null);
  const lastGlobalTickRef = useRef<number>(Date.now());
  const isSlackingRef = useRef(isSlacking);
  const isOvertimeRef = useRef(isOvertime);
  const configRef = useRef(config);
  
  isSlackingRef.current = isSlacking;
  isOvertimeRef.current = isOvertime;
  configRef.current = config;

  useEffect(() => {
    lastGlobalTickRef.current = Date.now();
    const code = `
      let interval;
      self.onmessage = function(e) {
        if (e.data === 'start') {
          interval = setInterval(() => self.postMessage('tick'), 1000);
        } else if (e.data === 'stop') {
          clearInterval(interval);
        }
      };
    `;
    const blob = new Blob([code], { type: 'application/javascript' });
    const worker = new Worker(URL.createObjectURL(blob));
    workerRef.current = worker;
    
    worker.onmessage = () => {
      const current = Date.now();
      const deltaSecs = (current - lastGlobalTickRef.current) / 1000;
      lastGlobalTickRef.current = current;
      
      setNow(new Date(current));
      
      if (isSlackingRef.current) {
        setSlackSecondsToday(prev => prev + deltaSecs);
      }
      if (isOvertimeRef.current) {
        setOvertimeSecondsToday(prev => prev + deltaSecs);
      }

      // Handle Pomodoro background tick
      if (isPomodoroActiveRef.current && pomodoroTimeLeftRef.current > 0) {
         const nextTime = pomodoroTimeLeftRef.current - deltaSecs;
         if (nextTime <= 0) {
            setPomodoroTimeLeft(0);
            setIsPomodoroActive(false);
            setCompletedPomodoros(prev => prev + 1);
            if ('Notification' in window && Notification.permission === "granted") {
               new Notification("番茄钟完成", { body: "时间到，休息一下吧！" });
            }
            playAlertSound(configRef.current.pomodoroEndSound);
         } else {
            setPomodoroTimeLeft(nextTime);
         }
      }

      // Handle Reminder background tick
      if (isReminderActiveRef.current && reminderTimeLeftRef.current > 0) {
         const nextTime = reminderTimeLeftRef.current - deltaSecs;
         if (nextTime <= 0) {
            setReminderTimeLeft(reminderMinsRef.current * 60);
            if ('Notification' in window && Notification.permission === "granted") {
               new Notification("定时提醒", { body: reminderTextRef.current });
            }
            playAlertSound(configRef.current.pomodoroBreakSound);
         } else {
            setReminderTimeLeft(nextTime);
         }
      }
    };
    
    worker.postMessage('start');
    
    return () => {
      worker.postMessage('stop');
      worker.terminate();
    };
  }, []);

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
  
  let monthsThisYear = localTime.getMonth();
  if (joinDateObj.getFullYear() === localTime.getFullYear()) {
      monthsThisYear = Math.max(0, localTime.getMonth() - joinDateObj.getMonth());
  }
  const earnedThisYear = Math.max(0, (monthsThisYear * config.monthlySalary) + earnedThisMonth);
  const displayEarned = conversionTimeframe === 'today' ? earnedToday : conversionTimeframe === 'month' ? earnedThisMonth : earnedThisYear;

  const daysThisWeek = localTime.getDay() === 0 ? 7 : localTime.getDay();
  const earnedThisWeek = Math.max(0, (config.monthlySalary / daysInMonth) * Math.max(0, daysThisWeek - 1) + earnedToday);
  
  const effectiveWorkThisWeek = Math.max(0, (daysThisWeek - 1) * config.hoursPerDay * 0.85 + (workSecondsToday - slackSecondsToday) / 3600);
  const slackThisWeek = Math.max(0, (daysThisWeek - 1) * config.hoursPerDay * 0.15 + slackSecondsToday / 3600);
  
  const bestDayEarned = Math.max(earnedToday, (config.monthlySalary / daysInMonth));
  const weekDaysStr = ['周日','周一','周二','周三','周四','周五','周六'];
  const bestDayStr = weekDaysStr[localTime.getDay()];

  // Countdown calculations
  const offWorkSecs = Math.max(0, endSecs - nowSecs);
  
  const paydayObj = new Date(localTime.getFullYear(), localTime.getMonth(), config.payday);
  if (localTime.getDate() > config.payday) {
     paydayObj.setMonth(paydayObj.getMonth() + 1);
  }
  const daysToPayday = localTime.getDate() === config.payday ? 0 : Math.ceil((paydayObj.getTime() - localTime.getTime()) / (1000 * 3600 * 24));
  
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
          <div className="px-4 md:px-8 pt-6 pb-2 flex flex-col gap-4 max-w-5xl mx-auto w-full">
            
            {/* Header & Date Row */}
            <div className="flex flex-row items-center justify-between gap-2 pb-2 mt-2">
              {/* Brand & Logo */}
              <div className="flex items-center gap-2 md:gap-3 shrink-0">
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
                <div className="flex flex-col justify-center shrink-0">
                  <h1 className="text-lg md:text-[22px] font-bold tracking-tight text-primary leading-none mb-1.5 flex items-center gap-2">
                    TimeMeter
                    <span className="text-[9px] bg-brand/10 text-brand px-1.5 py-0.5 rounded font-mono font-medium border border-brand/20 hidden md:inline-flex">BETA</span>
                  </h1>
                  <p className="text-[9px] md:text-[10px] text-brand/90 font-mono uppercase tracking-[0.2em] font-bold leading-none">Pay Per Sec</p>
                </div>
              </div>

              {/* Date & Theme Toggle */}
              <div className="flex items-center gap-1.5 md:gap-3 bg-card-inner/60 backdrop-blur-md pl-2 md:pl-4 pr-1.5 md:pr-2 py-1 md:py-1.5 rounded-2xl border border-app shadow-sm min-w-0">
                <div className="flex flex-col text-right truncate">
                  <div className="text-[10px] md:text-sm font-semibold text-primary mb-0.5 flex items-center gap-1 md:gap-2 justify-end truncate">
                    <span className="text-[9px] md:text-xs text-secondary font-medium hidden md:inline-block">周{['日','一','二','三','四','五','六'][localTime.getDay()]}</span>
                    <span className="truncate">{localTime.getFullYear()}-{String(localTime.getMonth() + 1).padStart(2, '0')}-{String(localTime.getDate()).padStart(2, '0')}</span>
                  </div>
                  <div className="text-[8px] md:text-[10px] text-secondary/80 font-medium tracking-wide truncate mt-0.5 md:mt-0">
                     {lunarDateStr}
                  </div>
                </div>
                <div className="w-[1px] h-6 md:h-7 bg-app block mx-0.5 md:mx-1 shrink-0"></div>
                <button onClick={() => setIsLightMode(!isLightMode)} className="w-7 h-7 md:w-8 md:h-8 bg-card rounded-xl border border-app shadow-inner text-primary flex items-center justify-center transition-all hover:scale-105 active:scale-95 group focus:outline-none focus:ring-2 focus:ring-brand shrink-0">
                   {isLightMode ? (
                     <svg className="w-3.5 h-3.5 md:w-4 md:h-4 text-amber-500 group-hover:rotate-45 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                   ) : (
                     <svg className="w-3.5 h-3.5 md:w-4 md:h-4 text-brand group-hover:-rotate-12 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                   )}
                </button>
              </div>
            </div>

            {/* Daily Work Progress */}
            <div className="bg-card rounded-[24px] p-5 border border-app shadow-2xl relative overflow-hidden mb-2 group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand/5 blur-3xl rounded-full pointer-events-none group-hover:bg-brand/10 transition-colors duration-500"></div>
              <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-card-inner/30 to-transparent pointer-events-none"></div>
              
              <div className="w-full flex-col flex gap-2 relative z-10">
                <div className="flex justify-between items-end pl-1 mb-1">
                  <span className="flex items-center gap-2 text-[11px] font-bold text-tertiary uppercase tracking-widest">
                    <div className="w-2 h-2 rounded-full border-[2px] border-brand shadow-[0_0_5px_rgba(0,255,65,0.5)]"></div>
                    今日进度标尺
                  </span>
                  <div className="flex items-end gap-1 font-mono">
                    <span className="text-brand font-black text-lg tracking-tighter drop-shadow-[0_0_8px_rgba(0,255,65,0.4)] leading-none mt-1">
                      {isRestDay ? '100' : nowSecs < startSecs ? '0' : nowSecs > endSecs ? '100' : `${((workSecondsToday / Math.max(1, endSecs - startSecs - (config.hasLunchBreak ? lunchEndSecs - lunchStartSecs : 0))) * 100).toFixed(1)}`}
                    </span>
                    <span className="text-xs text-brand/80 font-bold mb-[2px]">%</span>
                  </div>
                </div>
                
                <div className="relative pt-6 pb-1">
                   {/* Main progress track */}
                   <div className="h-4 bg-[#141414] rounded-full overflow-hidden border border-app shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)] relative">
                      <div 
                        className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#00cc33] via-[#00FF41] to-[#e4ff00] transition-all duration-1000 ease-linear" 
                        style={{ width: `${nowSecs < startSecs ? 0 : nowSecs > endSecs ? 100 : ((workSecondsToday / Math.max(1, endSecs - startSecs - (config.hasLunchBreak ? lunchEndSecs - lunchStartSecs : 0))) * 100)}%` }} 
                      >
                         {/* Custom striped pattern for progress bar */}
                         <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(255,255,255,0.5) 4px, rgba(255,255,255,0.5) 8px)' }}></div>
                         {/* Shine effect */}
                         <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/30 to-transparent"></div>
                      </div>
                   </div>

                   {/* Progress Indicator Icon moving along the track */}
                   <div 
                     className="absolute top-0 transform -translate-x-1/2 -translate-y-2.5 transition-all duration-1000 ease-linear z-20"
                     style={{ left: `${nowSecs < startSecs ? 0 : nowSecs > endSecs ? 100 : ((workSecondsToday / Math.max(1, endSecs - startSecs - (config.hasLunchBreak ? lunchEndSecs - lunchStartSecs : 0))) * 100)}%` }}
                   >
                     <div className="bg-card border-2 border-brand text-[22px] w-11 h-11 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(0,255,65,0.4)] relative bg-gradient-to-br from-card to-card-inner">
                       <span className="absolute -top-1 -right-1 text-[9px] bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center font-bold shadow-sm transform -rotate-12 animate-pulse">!</span>
                       {isRestDay ? '🏖️' : nowSecs < startSecs ? '😴' : nowSecs > endSecs ? '🎉' : isLunchBreak ? '🍚' : '🏃'}
                     </div>
                   </div>

                   {/* Timestamps */}
                   <div className="flex justify-between text-[10px] text-tertiary/60 font-mono mt-3 px-2 font-medium">
                      <span>{config.startTime}</span>
                      {config.hasLunchBreak && (
                        <div className="flex flex-col items-center gap-0.5 text-orange-500/60 relative -mt-1.5 group-hover:text-orange-500 transition-colors">
                           <span className="text-[8px] bg-orange-500/10 px-1.5 py-0.5 rounded-sm">午休期间</span>
                           <span>{config.lunchStartTime} - {config.lunchEndTime}</span>
                        </div>
                      )}
                      <span>{config.endTime}</span>
                   </div>
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
          <div className="px-4 md:px-8 py-2 max-w-5xl mx-auto w-full">
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
                     <div className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider mb-1 inline-block ${isRestDay ? 'text-primary bg-blue-500/10' : nowSecs < startSecs ? 'text-secondary bg-secondary/10' : nowSecs > endSecs ? 'text-brand bg-brand/10' : isLunchBreak ? 'text-orange-500 bg-orange-500/10' : 'text-primary bg-primary/10'}`}>
                        {isRestDay ? '周末休息 ✨' : nowSecs < startSecs ? '还没上班' : nowSecs > endSecs ? '已经下班' : isLunchBreak ? '午休干饭 🍚' : '牛马进行中 ⚡️'}
                     </div>
                     <div className="text-[18px] font-mono font-bold tracking-tight text-primary/90">
                        {pad0(Math.floor(workSecondsToday / 3600))}:
                        {pad0(Math.floor((workSecondsToday % 3600) / 60))}:
                        {pad0(workSecondsToday % 60)}
                     </div>
                  </div>

                  <div className="w-full mb-1">
                     <div className="bg-card-inner rounded-xl p-1.5 border border-app text-center">
                        <span className="text-[9px] text-tertiary block mb-0.5">牛马指数</span>
                        <span className="text-[11px] font-medium text-primary">
                          {isRestDay ? "🏖️ 幸福躺平中" :
                           nowSecs < startSecs ? "😴 续命睡眠中" :
                           nowSecs >= endSecs ? "🎉 灵魂归位" : 
                           isLunchBreak ? "😋 能量补给中" :
                           (workSecondsToday / Math.max(1, (endSecs - startSecs))) > 0.9 ? "💀 彻底疯狂" :
                           (workSecondsToday / Math.max(1, (endSecs - startSecs))) > 0.7 ? "🤯 逐渐暴躁" :
                           (workSecondsToday / Math.max(1, (endSecs - startSecs))) > 0.4 ? "🔋 电量过半" :
                           (workSecondsToday / Math.max(1, (endSecs - startSecs))) > 0.2 ? "🤔 陷入沉思" :
                           "☕️ 能量回收中"}
                        </span>
                     </div>
                  </div>

                  <div className="w-full py-2 rounded-xl flex flex-col items-center justify-center font-black uppercase tracking-tighter bg-card border-none">
                    <span className={`text-xs ${isRestDay ? 'text-primary' : nowSecs < startSecs ? 'text-secondary' : nowSecs > endSecs ? 'text-brand' : isLunchBreak ? 'text-orange-500' : 'text-primary'}`}>
                      {isRestDay ? '周末愉快 🏖️' : nowSecs < startSecs ? '等待打工' : nowSecs > endSecs ? '下班啦 ✨' : isLunchBreak ? '干饭啦 🍚' : '正在牛马 ⚡️'}
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
                <div className="flex flex-col gap-2 mb-3">
                   <div className="flex items-center justify-between">
                      <select 
                        className="appearance-none bg-transparent text-[11px] text-secondary font-medium outline-none cursor-pointer hover:text-primary transition-colors pr-4 relative"
                        style={{ background: `url("data:image/svg+xml;utf8,<svg viewBox='0 0 24 24' width='12' height='12' xmlns='http://www.w3.org/2000/svg'><path fill='gray' d='M7 10l5 5 5-5z'/></svg>") no-repeat right center` }}
                        value={conversionTimeframe}
                        onChange={e => setConversionTimeframe(e.target.value as any)}
                      >
                         <option value="today">今日收入换算 & 购买力</option>
                         <option value="month">本月收入换算 & 购买力</option>
                         <option value="year">本年收入换算 & 购买力</option>
                      </select>
                      <div className="flex gap-2">
                         <div className="text-[10px] bg-primary/5 text-primary/80 px-2 py-1 flex items-center rounded-full hover:bg-primary/10 border border-app transition-colors cursor-pointer" onClick={generateShareImage}>📸 分享</div>
                         <div className="text-[10px] bg-brand/10 text-brand px-2 py-1 flex items-center rounded-full gap-1 border border-brand/20 shadow-sm cursor-pointer" onClick={() => setShowUSD(!showUSD)}>双币展示</div>
                      </div>
                   </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2 mb-3">
                   <div className="bg-card-inner rounded-xl p-3 border border-app flex flex-col items-center justify-center relative overflow-hidden">
                      <span className="text-[10px] text-tertiary mb-1 tracking-wider">人民币 (CNY)</span>
                      <span className="text-brand font-mono text-2xl font-bold tracking-tight">¥{hide(formatMoney(displayEarned))}</span>
                   </div>
                   <div className="bg-card-inner rounded-xl p-3 border border-app flex flex-col items-center justify-center relative overflow-hidden">
                      <span className="text-[10px] text-tertiary mb-1 tracking-wider">美元 (USD)</span>
                      <span className="text-primary font-mono text-2xl font-bold tracking-tight">${hide(formatMoney(displayEarned / config.exchangeRateUsd))}</span>
                   </div>
                </div>

                <div className="flex overflow-x-auto no-scrollbar gap-2 pb-1">
                   <ConversionCard icon={<span className="text-xl filter drop-shadow-md">🧋</span>} label="奶茶" value={hide((displayEarned / MILK_TEA_PRICE).toFixed(1))} unit="杯" color="text-orange-300" />
                   <ConversionCard icon={<span className="text-xl filter drop-shadow-md">☕️</span>} label="咖啡" value={hide((displayEarned / COFFEE_PRICE).toFixed(1))} unit="杯" color="text-amber-400" />
                   <ConversionCard icon={<span className="text-xl filter drop-shadow-md">⛽️</span>} label="汽油" value={hide((displayEarned / GAS_PRICE).toFixed(1))} unit="L" color="text-red-400" />
                   <ConversionCard icon={<span className="text-xl filter drop-shadow-md">📱</span>} label="iPhone" value={hide(((displayEarned / IPHONE_PRICE) * 100).toFixed(2))} unit="%" color="text-blue-300" />
                   <ConversionCard icon={<span className="text-xl filter drop-shadow-md">✨</span>} label={config.customItemName} value={hide((displayEarned / config.customItemPrice).toFixed(2))} unit="个" color="text-purple-400" />
                </div>
             </div>
          </div>

          {/* 4. COUNTDOWN SYSTEM (Horizontal Scroll) */}
          <div className="px-4 md:px-8 py-2 max-w-5xl mx-auto w-full">
             <div className="flex items-center justify-between mb-3 text-sm">
                <span className="text-primary font-medium">倒计时</span>
                <span className="text-xs text-tertiary cursor-pointer flex items-center" onClick={() => setShowAllCountdowns(true)}>全部 <ChevronRight size={12} /></span>
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
                {(config.customEvents || []).map((evt: any) => {
                   const evtDateObj = new Date(evt.date);
                   const daysToEvt = Math.ceil((evtDateObj.getTime() - localTime.getTime()) / (1000 * 3600 * 24));
                   return (
                     <CountdownCard 
                        key={evt.id}
                        title={evt.name}
                        time={daysToEvt < 0 ? `已过去 ${Math.abs(daysToEvt)} 天` : `${daysToEvt} 天`}
                        desc={evtDateObj.toLocaleDateString()}
                        progress={daysToEvt < 0 ? 100 : Math.max(0, 100 - (daysToEvt / 365) * 100)}
                        icon={<span className="text-sm">⭐</span>}
                        color={evt.color as keyof typeof colorMap || "purple"}
                     />
                   );
                })}
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
          <div className="px-4 md:px-8 py-2 mt-2 mb-8 flex flex-col gap-3 max-w-5xl mx-auto w-full">
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
                  onClick={() => {
                    if (!isSlacking && !isCurrentlyWorkingTime) {
                      setToast({ message: "当前非工作时间，你在自愿加班吗？不算摸鱼哦！", type: 'info' });
                      return;
                    }
                    setIsSlacking(!isSlacking);
                  }}
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
                   <div className="text-[10px] text-tertiary mb-1 flex items-center gap-1"><span className="text-[10px]">🐟</span> 本月摸鱼总收益</div>
                   <div className="text-sm font-mono text-brand font-bold">{sym} {hide(formatMoney((slackLoss * (localTime.getDate() * 0.7)) / ex))}</div>
                </div>
                <div className="bg-card-inner p-3 rounded-xl border border-red-500/10 flex flex-col justify-center shadow-inner">
                   <div className="text-[10px] text-tertiary mb-1 flex items-center gap-1"><span className="text-[10px]">🏢</span> 本月义务加班送钱</div>
                   <div className="text-sm font-mono text-red-500 font-bold">{sym} {hide(formatMoney((overtimeLoss * (localTime.getDate() * 0.8)) / ex))}</div>
                </div>
                <div className="col-span-2 bg-gradient-to-r from-card to-card-inner p-3 rounded-xl border border-app flex justify-between items-center shadow-sm">
                   <div className="flex flex-col">
                      <div className="text-[10px] text-tertiary flex items-center gap-1 mb-0.5">💰 精确时薪折算</div>
                      <div className="text-sm font-mono text-primary">{sym} {hide(formatMoney(hourlyRate / ex))} <span className="text-[9px] text-secondary">/小时</span></div>
                   </div>
                   <div className="flex flex-col text-right">
                      <div className="text-[10px] text-tertiary flex justify-end items-center gap-1 mb-0.5">👑 全国牛马击败率</div>
                      <div className="text-sm font-mono text-brand">{Math.min(99.9, Math.max(1.0, (config.monthlySalary / 10000) * 80)).toFixed(1)}%</div>
                   </div>
                </div>
              </div>
           </div>
           <div className="bg-card rounded-2xl p-5 border border-app shadow-xl space-y-4 relative overflow-hidden mt-4">
               <div>
                  <h3 className="text-sm font-semibold text-primary mb-3">📊 时间价值报告 (周报)</h3>
                  <div className="grid grid-cols-2 gap-3">
                     <div className="bg-card-inner p-3 rounded-xl border border-brand/20 flex flex-col justify-center">
                        <div className="text-[10px] text-tertiary mb-1">本周摸鱼收益</div>
                        <div className="text-sm font-mono text-brand font-bold">{sym} {hide(formatMoney((slackThisWeek * hourlyRate) / ex))}</div>
                     </div>
                     <div className="bg-card-inner p-3 rounded-xl border border-app flex flex-col justify-center">
                        <div className="text-[10px] text-tertiary mb-1">本周最赚钱一天</div>
                        <div className="text-sm font-mono text-primary tracking-tight">{bestDayStr} ({sym}{hide(formatMoney(bestDayEarned / ex))})</div>
                     </div>
                  </div>
                  <div className="mt-3 bg-card-inner p-3 rounded-xl border border-app shadow-sm">
                     <div className="flex justify-between items-center mb-1 text-[10px]">
                        <span className="text-tertiary">时间分配</span>
                        <span className="text-secondary font-mono">¥ {hide(formatMoney(hourlyRate / ex))}/h</span>
                     </div>
                     <div className="w-full h-3 flex rounded-full overflow-hidden border border-app">
                        <div className="bg-brand transition-all" style={{ width: `${(effectiveWorkThisWeek / (effectiveWorkThisWeek + slackThisWeek || 1)) * 100}%` }}></div>
                        <div className="bg-app-strong transition-all" style={{ width: `${(slackThisWeek / (effectiveWorkThisWeek + slackThisWeek || 1)) * 100}%` }}></div>
                     </div>
                     <div className="flex justify-between text-[10px] mt-1">
                        <span className="text-brand">有效这周 {effectiveWorkThisWeek.toFixed(1)}h</span>
                        <span className="text-tertiary">摸鱼 {slackThisWeek.toFixed(1)}h</span>
                     </div>
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
           
           <div className="bg-brand/5 border border-brand/20 rounded-2xl p-4 mb-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-brand/10 flex items-center justify-center text-brand shrink-0">
                 <RefreshCw size={20} />
              </div>
              <div className="flex-1">
                 <p className="text-xs font-bold text-brand mb-0.5">隐私保护</p>
                 <p className="text-[10px] text-secondary">你的时间有价值，你的数据也一样。所有信息仅存于本地，收入只有你自己知道。</p>
              </div>
           </div>
           <div className="bg-card rounded-2xl p-5 border border-app space-y-5 shadow-lg">
              <div>
                 <label className="text-xs text-secondary mb-1.5 block">每月税后薪资 (人民币)</label>
                 <input type="number" 
                   className="w-full appearance-none m-0 bg-card-inner border border-app-strong rounded-xl px-3 h-[44px] block box-border placeholder:text-secondary/50 text-brand font-mono text-base focus:border-brand focus:outline-none transition-colors"
                   value={config.monthlySalary === 0 ? '' : config.monthlySalary}
                   onChange={e => setConfig({...config, monthlySalary: e.target.value === '' ? 0 : Number(e.target.value)})}
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
                   value={config.hoursPerDay === 0 ? '' : config.hoursPerDay}
                   onChange={e => setConfig({...config, hoursPerDay: e.target.value === '' ? 0 : Number(e.target.value)})}
                 />
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="text-xs text-secondary mb-1.5 block">发薪日 (每月X号)</label>
                    <input type="number" 
                      className="w-full appearance-none m-0 bg-card-inner border border-app-strong rounded-xl px-3 h-[44px] block box-border placeholder:text-secondary/50 text-primary font-mono text-base focus:border-brand focus:outline-none transition-colors"
                      value={config.payday === 0 ? '' : config.payday}
                      onChange={e => setConfig({...config, payday: e.target.value === '' ? 0 : Number(e.target.value)})}
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
                      value={config.exchangeRateUsd === 0 ? '' : config.exchangeRateUsd}
                      onChange={e => setConfig({...config, exchangeRateUsd: e.target.value === '' ? 0 : Number(e.target.value)})}
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
              <div className="flex items-center justify-between">
                 <label className="text-xs text-secondary font-medium block">自定义倒计时记录</label>
                 <button 
                   onClick={() => setConfig({
                     ...config, 
                     customEvents: [...(config.customEvents || []), { id: Math.random().toString(), name: '新事件', date: new Date().toISOString().split('T')[0], color: 'purple' }]
                   })}
                   className="text-xs text-brand border border-brand/30 px-3 py-1 rounded-full hover:bg-brand/10 transition-colors"
                 >添加 +</button>
              </div>
              <div className="space-y-4">
                 {(config.customEvents || []).map((evt: any, i: number) => (
                    <div key={evt.id} className="p-3 bg-card-inner/50 rounded-xl border border-app relative flex flex-col gap-3">
                       <button 
                         onClick={() => setConfig({
                             ...config, 
                             customEvents: config.customEvents.filter((_: any, idx: number) => idx !== i)
                         })}
                         className="absolute -top-2 -right-2 w-6 h-6 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center hover:bg-red-500/20"
                       ><span className="text-xs">×</span></button>
                       <div className="grid grid-cols-2 gap-3">
                          <div>
                             <label className="text-[10px] text-tertiary mb-1 block">名称</label>
                             <input type="text"
                               className="w-full appearance-none m-0 bg-card border border-app rounded-lg px-2 h-[36px] box-border text-[13px] text-primary focus:border-brand focus:outline-none"
                               value={evt.name}
                               onChange={e => {
                                 const updated = [...config.customEvents];
                                 updated[i].name = e.target.value;
                                 setConfig({...config, customEvents: updated});
                               }}
                             />
                          </div>
                          <div>
                             <label className="text-[10px] text-tertiary mb-1 block">颜色</label>
                             <select
                               className="w-full appearance-none m-0 bg-card border border-app rounded-lg px-2 h-[36px] box-border text-[13px] text-primary focus:border-brand focus:outline-none"
                               value={evt.color}
                               onChange={e => {
                                 const updated = [...config.customEvents];
                                 updated[i].color = e.target.value;
                                 setConfig({...config, customEvents: updated});
                               }}
                             >
                                <option value="purple">紫色</option>
                                <option value="amber">橙色</option>
                                <option value="red">红色</option>
                                <option value="green">绿色</option>
                                <option value="yellow">黄色</option>
                                <option value="blue">蓝色</option>
                             </select>
                          </div>
                       </div>
                       <div>
                          <label className="text-[10px] text-tertiary mb-1 block">日期</label>
                          <input type="date"
                            className="w-full appearance-none m-0 bg-card border border-app rounded-lg px-3 h-[36px] block box-border text-primary font-mono text-sm focus:border-brand focus:outline-none"
                            value={evt.date}
                            onChange={e => {
                               const updated = [...config.customEvents];
                               updated[i].date = e.target.value;
                               setConfig({...config, customEvents: updated});
                            }}
                          />
                       </div>
                    </div>
                 ))}
                 {(!config.customEvents || config.customEvents.length === 0) && (
                    <div className="text-center py-6 text-tertiary text-xs bg-card-inner/30 rounded-xl border border-app border-dashed">
                      暂无自定义记录
                    </div>
                 )}
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

           <div className="bg-card rounded-2xl p-5 md:p-8 lg:p-10 border border-app space-y-4 shadow-lg max-w-4xl mx-auto mb-4">
               <div>
                  <h3 className="text-sm font-bold text-primary mb-1">循环提醒功能</h3>
                  <p className="text-xs text-secondary mb-4">后台稳定运行的定时提醒（如喝水/站立）。</p>
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div>
                     <label className="text-xs text-secondary mb-1.5 block">提醒间隔 (分钟)</label>
                     <input type="number" 
                       className="w-full appearance-none m-0 bg-card-inner border border-app-strong rounded-xl px-3 h-[44px] block box-border placeholder:text-secondary/50 text-brand font-mono text-base focus:border-brand focus:outline-none transition-colors"
                       value={reminderMins}
                       onChange={e => {
                         const v = Number(e.target.value);
                         setReminderMins(v);
                         if (!isReminderActive) setReminderTimeLeft(v * 60);
                       }}
                     />
                  </div>
                  <div>
                     <label className="text-xs text-secondary mb-1.5 block">提醒内容</label>
                     <input type="text" 
                       className="w-full bg-card-inner border border-app-strong rounded-xl px-3 h-[44px] block box-border text-primary font-sans text-sm focus:border-brand focus:outline-none transition-colors"
                       value={reminderText}
                       onChange={e => setReminderText(e.target.value)}
                     />
                  </div>
               </div>
               <button
                 onClick={() => {
                    if (!isReminderActive && 'Notification' in window && Notification.permission === "default") {
                       Notification.requestPermission().catch(()=>{});
                    }
                    setIsReminderActive(!isReminderActive);
                    if (!isReminderActive) {
                       setReminderTimeLeft(reminderMins * 60);
                    }
                 }}
                 className={`w-full py-3 rounded-xl font-semibold text-sm transition-all shadow-lg ${isReminderActive ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-brand text-[#141414]'}`}
               >
                 {isReminderActive ? `停止提醒 (剩余 ${Math.floor(reminderTimeLeft / 60)} 分钟)` : '开启提醒'}
               </button>
           </div>

           <div className="bg-card rounded-2xl p-5 md:p-8 lg:p-10 border border-app space-y-4 shadow-lg max-w-4xl mx-auto mb-4">
               <div>
                  <h3 className="text-sm font-bold text-primary mb-1">提示音设置</h3>
                  <p className="text-xs text-secondary mb-4">设定番茄钟与提醒的提示音。</p>
               </div>
               <div className="grid grid-cols-3 gap-4">
                  <div>
                     <label className="text-xs text-secondary mb-1.5 block">番茄钟开始</label>
                     <select 
                       className="w-full appearance-none m-0 bg-card-inner border border-app-strong rounded-xl px-3 h-[44px] block box-border text-primary text-sm focus:border-brand focus:outline-none transition-colors"
                       value={config.pomodoroStartSound}
                       onChange={e => {
                         setConfig({...config, pomodoroStartSound: e.target.value});
                         if(e.target.value !== 'none') playAlertSound(e.target.value);
                       }}
                     >
                       <option value="none">无</option>
                       <option value="beep">短促 (Beep)</option>
                       <option value="bell">清脆 (Bell)</option>
                       <option value="chime">和弦 (Chime)</option>
                       <option value="digital">电子 (Digital)</option>
                     </select>
                  </div>
                  <div>
                     <label className="text-xs text-secondary mb-1.5 block">番茄钟结束</label>
                     <select 
                       className="w-full appearance-none m-0 bg-card-inner border border-app-strong rounded-xl px-3 h-[44px] block box-border text-primary text-sm focus:border-brand focus:outline-none transition-colors"
                       value={config.pomodoroEndSound}
                       onChange={e => {
                         setConfig({...config, pomodoroEndSound: e.target.value});
                         if(e.target.value !== 'none') playAlertSound(e.target.value);
                       }}
                     >
                       <option value="none">无</option>
                       <option value="beep">短促 (Beep)</option>
                       <option value="bell">清脆 (Bell)</option>
                       <option value="chime">和弦 (Chime)</option>
                       <option value="digital">电子 (Digital)</option>
                     </select>
                  </div>
                  <div>
                     <label className="text-xs text-secondary mb-1.5 block">提醒/休息结束</label>
                     <select 
                       className="w-full appearance-none m-0 bg-card-inner border border-app-strong rounded-xl px-3 h-[44px] block box-border text-primary text-sm focus:border-brand focus:outline-none transition-colors"
                       value={config.pomodoroBreakSound}
                       onChange={e => {
                         setConfig({...config, pomodoroBreakSound: e.target.value});
                         if(e.target.value !== 'none') playAlertSound(e.target.value);
                       }}
                     >
                       <option value="none">无</option>
                       <option value="beep">短促 (Beep)</option>
                       <option value="bell">清脆 (Bell)</option>
                       <option value="chime">和弦 (Chime)</option>
                       <option value="digital">电子 (Digital)</option>
                     </select>
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
                        value={config.customItemPrice === 0 ? '' : config.customItemPrice}
                        onChange={e => setConfig({...config, customItemPrice: e.target.value === '' ? 0 : parseFloat(e.target.value)})}
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

           <div className="mt-8 text-center opacity-50 flex flex-col gap-1 text-[11px] font-mono text-tertiary pb-8">
              <p>Architect & Author</p>
              <p className="font-semibold text-primary">Barry</p>
              <a href="mailto:barry.bai@hotwavehk.com" className="hover:text-brand transition-colors">barry.bai@hotwavehk.com</a>
              <p className="mt-2 text-[10px] tracking-widest uppercase">Version 1.0.10</p>
           </div>
        </div>
      )}

      
      {activeTab === 'pomodoro' && (
        <div className="flex-1 overflow-y-auto no-scrollbar px-4 md:px-8 pt-6 pb-24 bg-card-inner md:rounded-3xl max-w-4xl mx-auto w-full">
           <div className="flex flex-col items-center justify-center min-h-full py-10">
             
             <div className="mb-8 w-full max-w-sm text-center">
               <h2 className="text-2xl font-bold tracking-tight text-primary">沉浸番茄钟</h2>
               <p className="text-xs text-secondary mt-1 font-medium">专注一炷香，干完去放飞</p>
             </div>

             <div className="w-full max-w-sm bg-card border border-app rounded-[32px] p-6 shadow-2xl relative flex flex-col items-center shrink-0">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-brand/5 blur-3xl rounded-full pointer-events-none" />
                 
                 <div className="relative w-48 h-48 mb-6 flex items-end justify-center shrink-0">
                     <div className="relative w-3 h-32 flex flex-col justify-end items-center mb-8">
                       {/* The stick that burns down */}
                       <div 
                         className="w-1.5 bg-gradient-to-t from-[#8E614A] to-[#C39A7F] rounded-t-full relative transition-[height] duration-1000 ease-linear shadow-[inset_0_0_2px_rgba(0,0,0,0.5)]"
                         style={{ height: `${Math.max(2, (pomodoroTimeLeft / (pomodoroLength * 60)) * 100)}%` }}
                       >
                          {/* Glowing tip & Smoke */}
                          {(isPomodoroActive || pomodoroTimeLeft !== pomodoroLength * 60) && pomodoroTimeLeft > 0 && (
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-gradient-to-r from-red-500 to-orange-400 rounded-full shadow-[0_0_8px_rgba(255,165,0,0.8)] animate-pulse">
                              {/* Smoke effect */}
                              {isPomodoroActive && (
                                <motion.div 
                                  initial={{ opacity: 0, y: 0, scale: 0.8 }}
                                  animate={{ opacity: [0, 0.5, 0], y: -30, scale: 1.5, x: [0, -10, 10, -5] }}
                                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                  className="absolute -top-4 left-1/2 -translate-x-1/2 w-4 h-8 bg-gray-300/30 blur-md rounded-full pointer-events-none"
                                />
                              )}
                            </div>
                          )}
                       </div>
                       {/* Stick holder */}
                       <div className="w-12 h-3 bg-[#4A4A4A] rounded-b-lg border-t-2 border-[#666] shadow-lg shrink-0"></div>
                     </div>

                     <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
                       <div className="text-7xl font-mono font-bold">{pad0(Math.floor(pomodoroTimeLeft / 60))}:{pad0(Math.floor(pomodoroTimeLeft % 60))}</div>
                     </div>
                     <div className="absolute bottom-0 text-3xl font-mono font-bold text-primary tabular-nums tracking-tighter filter drop-shadow-md">
                       {pad0(Math.floor(pomodoroTimeLeft / 60))}:{pad0(Math.floor(pomodoroTimeLeft % 60))}
                     </div>
                 </div>

                 {/* task input */}
                 <div className="w-full mb-6 relative z-10">
                    <input 
                      type="text" 
                      value={pomodoroTask}
                      onChange={(e) => setPomodoroTask(e.target.value)}
                      placeholder="今日待办事项..." 
                      className="w-full bg-card-inner border border-app rounded-xl p-3 text-center text-sm focus:outline-none focus:ring-2 focus:ring-brand shadow-inner text-primary placeholder:text-tertiary"
                    />
                 </div>

                 {/* Focus Income Tracker */}
                 <div className="mb-6 w-full max-w-[200px] flex flex-col items-center justify-center p-3 rounded-2xl bg-gradient-to-br from-brand/5 to-transparent border border-brand/10 relative z-10">
                   <span className="text-[10px] text-tertiary mb-1">本次专注已赚取</span>
                   <span className="text-xl font-mono font-bold text-brand shadow-sm">
                     ¥{formatMoney(((pomodoroLength * 60 - pomodoroTimeLeft) / 60) * minuteRate)}
                   </span>
                 </div>

                 {/* buttons */}
                 <div className="flex items-center gap-4 relative z-20 pb-4">
                    {!isPomodoroActive && (pomodoroTimeLeft >= pomodoroLength * 60 - 5) ? (
                       <button 
                         onClick={togglePomodoro} 
                         className="px-10 py-5 bg-brand text-[#141414] rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(0,255,65,0.4)] hover:scale-105 active:scale-95 transition-all text-lg font-black"
                       >
                         <Play size={24} className="mr-3 fill-current" />
                         开始专注
                       </button>
                    ) : (
                       <div className="flex gap-4">
                         <button 
                           onClick={togglePomodoro} 
                           className="px-8 py-4 bg-brand text-[#141414] rounded-2xl flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all font-bold"
                         >
                           {isPomodoroActive ? (
                             <><Pause size={22} className="mr-2 fill-current" /> 暂停</>
                           ) : (
                             <><Play size={22} className="mr-2 fill-current" /> 继续</>
                           )}
                         </button>
                         <button 
                           onClick={resetPomodoro} 
                           className="px-8 py-4 bg-card-inner border border-app text-red-500 rounded-2xl flex items-center justify-center shadow hover:scale-105 active:scale-95 transition-all font-bold"
                         >
                           <Square size={22} className="mr-2 fill-current" /> 结束
                         </button>
                       </div>
                    )}
                 </div>
             </div>

             {/* Presets */}
             <div className="mt-8 flex gap-3 text-xs">
                <button onClick={() => handlePomodoroLengthChange(25)} className={`px-4 py-2 rounded-full border ${pomodoroLength === 25 ? 'bg-brand/10 border-brand/30 text-brand font-bold' : 'bg-card border-app text-secondary hover:text-primary'}`}>
                  25分钟
                </button>
                <button onClick={() => handlePomodoroLengthChange(50)} className={`px-4 py-2 rounded-full border ${pomodoroLength === 50 ? 'bg-brand/10 border-brand/30 text-brand font-bold' : 'bg-card border-app text-secondary hover:text-primary'}`}>
                  50分钟
                </button>
                <button onClick={() => handlePomodoroLengthChange(90)} className={`px-4 py-2 rounded-full border ${pomodoroLength === 90 ? 'bg-brand/10 border-brand/30 text-brand font-bold' : 'bg-card border-app text-secondary hover:text-primary'}`}>
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
              <div className="grid grid-cols-7 gap-1 text-center mb-4">
                 {['日','一','二','三','四','五','六'].map(d => (
                    <div key={d} className="text-[13px] text-tertiary font-bold py-1">{d}</div>
                 ))}
              </div>
              <CalendarGrid 
                 calendarDate={calendarDate}
                 localTime={localTime}
                 config={config}
                 memos={memos}
                 onDateClick={handleDateClick}
              />
              <div className="text-center mt-6 text-[11px] text-tertiary font-medium bg-card-inner/50 py-2.5 rounded-xl border border-app border-dashed">
                 提示：点击日期记录备忘事项，所有数据均保留在您本地。
              </div>
              <div className="text-center pt-8 pb-4 opacity-30">
                 <p className="text-[10px] font-mono tracking-widest text-tertiary uppercase">Version 1.0.10</p>
              </div>
            </div>
         </div>
      )}

      {activeTab !== 'home' && activeTab !== 'pomodoro' && activeTab !== 'profile' && activeTab !== 'data' && activeTab !== 'calendar' && (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-card-inner z-40 absolute inset-0 top-0">
           <h2 className="text-xl font-bold mb-2">🚧 正在施工</h2>
           <p className="text-sm">功能正在开发中...</p>
           <p className="text-xs text-secondary mt-1">Please come back later</p>
        </div>
      )}

      
      {/* Memo Modal */}
      <AnimatePresence>
        {selectedMemoDate && (
          <MemoModal 
            key="memo-modal"
            date={selectedMemoDate}
            memos={(memos || {})[selectedMemoDate] || []}
            onClose={handleMemoModalClose}
            onSave={handleMemoModalSave}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
         {showAllCountdowns && (
            <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-black/50 backdrop-blur-md px-0 md:px-4">
               <motion.div 
                 initial={{ y: "100%", opacity: 0 }}
                 animate={{ y: 0, opacity: 1 }}
                 exit={{ y: "100%", opacity: 0 }}
                 transition={{ type: "spring", damping: 25, stiffness: 300 }}
                 className="w-full md:max-w-md bg-card rounded-t-3xl md:rounded-3xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden"
               >
                  <div className="p-5 flex justify-between items-center border-b border-app">
                     <h3 className="text-lg font-bold text-primary flex items-center gap-2">
                        <Timer size={20} className="text-brand" />
                        所有记录
                     </h3>
                     <button onClick={() => setShowAllCountdowns(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-card-inner border border-app text-tertiary hover:text-primary transition-colors">
                        <X size={16} />
                     </button>
                  </div>
                  <div className="p-5 overflow-y-auto space-y-4 no-scrollbar">
                     <div className="grid grid-cols-2 gap-3">
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
                            title="距离退休"
                            time={`${daysToRetire}天`}
                            desc={retireDateObj.toLocaleDateString()}
                            progress={daysToRetire < 0 ? 100 : Math.max(0, 100 - (daysToRetire / (365*30)) * 100)}
                            icon={<span className="text-sm">🪑</span>}
                            color="red"
                         />
                         {(config.customEvents || []).map((evt: any) => {
                            const evtDateObj = new Date(evt.date);
                            const daysToEvt = Math.ceil((evtDateObj.getTime() - localTime.getTime()) / (1000 * 3600 * 24));
                            return (
                              <CountdownCard 
                                 key={evt.id}
                                 title={evt.name}
                                 time={daysToEvt < 0 ? `已过去 ${Math.abs(daysToEvt)} 天` : `${daysToEvt} 天`}
                                 desc={evtDateObj.toLocaleDateString()}
                                 progress={daysToEvt < 0 ? 100 : Math.max(0, 100 - (daysToEvt / 365) * 100)}
                                 icon={<span className="text-sm">⭐</span>}
                                 color={evt.color as keyof typeof colorMap || "purple"}
                              />
                            );
                         })}
                     </div>
                  </div>
               </motion.div>
            </div>
         )}
      </AnimatePresence>

        <div className="fixed bottom-0 left-0 right-0 w-full md:max-w-4xl lg:max-w-6xl xl:max-w-[1400px] mx-auto bg-card-inner/90 backdrop-blur-lg border-t md:border border-app py-2 md:py-4 px-4 md:px-16 flex justify-between items-center z-50 md:rounded-b-3xl md:rounded-t-none md:bottom-4 xl:rounded-3xl shadow-2xl md:mb-4 xl:mb-0 transition-all duration-300">
         <NavItem icon={<Home size={22} />} label="首页" active={activeTab === 'home'} onClick={() => setActiveTab('home')} />
         <NavItem icon={<Timer size={22} />} label="番茄钟" active={activeTab === 'pomodoro'} onClick={() => setActiveTab('pomodoro')} />
         <NavItem icon={<CalendarIcon size={22} />} label="日历" active={activeTab === 'calendar'} onClick={() => { setActiveTab('calendar'); setCalendarDate(new Date()); }} />
         <NavItem icon={<PieChart size={22} />} label="数据" active={activeTab === 'data'} onClick={() => setActiveTab('data')} />
         <NavItem icon={<Settings size={22} />} label="设定" active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} />
      </div>
      
      {/* Off-screen Share Layout */}
      <div className="fixed -left-[9999px] top-0 pointer-events-none" aria-hidden="true">
        <div ref={shareRef} style={{ width: '375px', backgroundColor: '#0E0E10', color: '#E0E0E0', padding: '24px', borderRadius: '24px', fontFamily: 'sans-serif', position: 'relative', overflow: 'hidden' }}>
          {/* Replaced blur with a simple colored circle to avoid filter issues */}
          <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '200px', height: '200px', backgroundColor: 'rgba(76, 175, 80, 0.1)', borderRadius: '50%' }} />
          
          <div style={{ position: 'relative', zIndex: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '32px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#4CAF50', display: 'flex', alignItems: 'center', justifyCenter: 'center' }}>
                <span style={{ color: '#FFFFFF', fontWeight: 'bold', fontSize: '14px', width: '100%', textAlign: 'center' }}>T</span>
              </div>
              <span style={{ fontWeight: 'bold', fontSize: '18px', letterSpacing: '-0.025em' }}>TimeMeter</span>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <p style={{ fontSize: '14px', color: '#888888', marginBottom: '4px' }}>今日摸鱼收入</p>
                <div style={{ fontSize: '36px', fontFamily: 'monospace', fontWeight: 'bold', color: '#4CAF50' }}>¥{formatMoney(earnedToday)}</div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ backgroundColor: '#1A1A1E', padding: '16px', borderRadius: '16px', border: '1px solid #2A2A2E' }}>
                  <p style={{ fontSize: '12px', color: '#888888', marginBottom: '4px' }}>本月累计</p>
                  <div style={{ fontSize: '18px', fontFamily: 'monospace', fontWeight: '600' }}>¥{formatMoney(earnedThisMonth)}</div>
                </div>
                <div style={{ backgroundColor: '#1A1A1E', padding: '16px', borderRadius: '16px', border: '1px solid #2A2A2E' }}>
                  <p style={{ fontSize: '12px', color: '#888888', marginBottom: '4px' }}>奶茶换算</p>
                  <div style={{ fontSize: '18px', fontFamily: 'monospace', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span>🧋</span> {(earnedToday / MILK_TEA_PRICE).toFixed(1)} 杯
                  </div>
                </div>
              </div>

              <div style={{ backgroundColor: 'rgba(76, 175, 80, 0.1)', border: '1px solid rgba(76, 175, 80, 0.2)', padding: '16px', borderRadius: '16px', marginTop: '16px' }}>
                <p style={{ color: '#81C784', fontWeight: '500', fontSize: '14px', lineHeight: '1.6' }}>我今天用 TimeMeter 赚了 ¥{formatMoney(earnedToday).split('.')[0]}，相当于 {Math.floor(earnedToday / MILK_TEA_PRICE)} 杯奶茶的自由！</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showShareModal && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowShareModal(false)}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-card border border-app p-4 rounded-3xl max-w-sm w-full shadow-2xl flex flex-col items-center"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="font-semibold text-primary mb-4 text-lg">一键生成分享图</h3>
              {shareImgUrl ? (
                <img src={shareImgUrl} alt="Share" className="w-full rounded-2xl shadow-lg border border-app filter brightness-[0.85]" />
              ) : (
                <div className="w-full aspect-[3/4] bg-card-inner rounded-2xl animate-pulse flex items-center justify-center text-secondary text-sm">生成中...</div>
              )}
              <p className="text-xs text-secondary mt-4 text-center">长按图片保存或分享给其他人</p>
              <button 
                className="w-full mt-4 py-3 bg-brand text-[#141414] font-semibold rounded-xl text-sm"
                onClick={() => setShowShareModal(false)}
              >
                完成
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 bg-brand text-[#141414] rounded-full shadow-2xl font-bold flex items-center gap-2 border border-brand/50"
          >
            <span>{toast.type === 'warn' ? '⚠️' : 'ℹ️'}</span>
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
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

