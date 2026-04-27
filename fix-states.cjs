const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const stateInjection = `
  // === Pomodoro State ===
  const [pomodoroLength, setPomodoroLength] = useState(25); // in minutes
  const [pomodoroTimeLeft, setPomodoroTimeLeft] = useState(25 * 60); // in seconds
  const [isPomodoroActive, setIsPomodoroActive] = useState(false);
  const [pomodoroTask, setPomodoroTask] = useState("");
  const [completedPomodoros, setCompletedPomodoros] = useState(0);

  useEffect(() => {
    let interval;
    if (isPomodoroActive && pomodoroTimeLeft > 0) {
      interval = setInterval(() => {
        setPomodoroTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (isPomodoroActive && pomodoroTimeLeft === 0) {
      setIsPomodoroActive(false);
      setCompletedPomodoros(prev => prev + 1);
      if (Notification.permission === "granted") {
         new Notification("番茄钟完成", { body: "休息一下吧！" });
      } else {
         alert("番茄钟完成，休息一下吧！");
      }
    }
    return () => clearInterval(interval);
  }, [isPomodoroActive, pomodoroTimeLeft]);

  const togglePomodoro = () => {
    if (!isPomodoroActive && Notification.permission === "default") {
       Notification.requestPermission();
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
      if (saved) return JSON.parse(saved);
    } catch(e) {}
    return {};
  });

  useEffect(() => {
    localStorage.setItem('niuma_memos', JSON.stringify(memos));
  }, [memos]);

  const [selectedMemoDate, setSelectedMemoDate] = useState(null);
  const [newMemoText, setNewMemoText] = useState("");
`;

code = code.replace(
  "  const [activeTab, setActiveTab] = useState('home');",
  stateInjection + "\\n  const [activeTab, setActiveTab] = useState('home');"
);

fs.writeFileSync('src/App.tsx', code);
