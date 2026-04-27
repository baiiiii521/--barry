const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. imports
code = code.replace(/export default function App\(\) \{/, `export default function App() {
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
  }, [profiles]);`);

// And the config state should initialize from local storage too
code = code.replace(/const \[config, setConfig\] = useState\(\{/, `const [config, setConfig] = useState(() => {
    try {
      const savedConfig = localStorage.getItem('niuma_config');
      if (savedConfig) return JSON.parse(savedConfig);
    } catch(e) {}
    return {`);

code = code.replace(/localTimezoneLabel: initialTz\.label,\s+\}\);/, `localTimezoneLabel: initialTz.label,
    };
  });
  
  useEffect(() => {
    localStorage.setItem('niuma_config', JSON.stringify(config));
  }, [config]);`);

const saveUI = `
           <div className="bg-card rounded-2xl p-5 border border-app space-y-4 shadow-lg mt-4">
              <h3 className="text-sm font-bold text-primary mb-2">配置方案保存</h3>
              <div className="flex gap-2 items-center">
                 <input type="text"
                   placeholder="输入方案名称，例如: 方案一线城市"
                   className="flex-1 bg-card-inner border border-app-strong rounded-xl px-3 py-2.5 text-primary text-sm focus:border-brand focus:outline-none transition-colors"
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
                   className="px-4 py-2 bg-brand text-black font-bold rounded-xl whitespace-nowrap hover:bg-[#00cc33]"
                 >保存当前</button>
              </div>
              {profiles.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {profiles.map(p => (
                    <div key={p.name} className="flex items-center bg-card-inner border border-app rounded-full px-3 py-1 text-xs">
                       <span className="text-primary mr-2 object-cover">{p.name}</span>
                       <button onClick={() => setConfig(p.config)} className="text-brand hover:underline mr-2">载入</button>
                       <button onClick={() => setProfiles(profiles.filter(x => x.name !== p.name))} className="text-red-500 hover:underline">删除</button>
                    </div>
                  ))}
                </div>
              )}
           </div>
`;

code = code.replace(/<div className="bg-card rounded-2xl p-5 border border-brand\/20 mt-4">/, saveUI + '\n           <div className="bg-card rounded-2xl p-5 border border-brand/20 mt-4">');

fs.writeFileSync('src/App.tsx', code);
