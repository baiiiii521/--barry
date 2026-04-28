const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Fix the "hide money" in Dual Currency section
code = code.replace(
    /¥\{formatMoney\(earnedToday\)\}/g,
    '¥{hide(formatMoney(earnedToday))}'
);

code = code.replace(
    /\$\{formatMoney\(earnedToday \/ config\.exchangeRateUsd\)\}/g,
    '${hide(formatMoney(earnedToday / config.exchangeRateUsd))}'
);


// 2. Fix Memo Modal Layout & Z-Index
code = code.replace(
    /className="fixed inset-0 z-\[60\] flex items-end md:items-center justify-center bg-black\/60 backdrop-blur-sm p-4 md:p-0"/,
    'className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"'
);
code = code.replace(
    /className="bg-card w-full max-w-md rounded-t-3xl md:rounded-3xl shadow-2xl border border-app overflow-hidden flex flex-col max-h-\[85vh\]"/,
    'className="bg-card w-full max-w-md rounded-3xl shadow-2xl border border-app overflow-hidden flex flex-col max-h-[85vh] md:max-h-[80vh]"'
);

// 3. UI Fixes: Layout adjustments
code = code.replace(
    /<span className="text-\[10px\] text-tertiary mb-1 tracking-wider uppercase">人民币 \(CNY\)<\/span>\s*<span className="text-brand font-mono text-xl font-bold tracking-tight">¥\{hide\(formatMoney\(earnedToday\)\)\}<\/span>/g,
    `<span className="text-[10px] text-tertiary mb-1 tracking-wider">人民币 (CNY)</span>\n                      <span className="text-brand font-mono text-2xl font-bold tracking-tight">¥{hide(formatMoney(earnedToday))}</span>`
);
code = code.replace(
    /<span className="text-\[10px\] text-tertiary mb-1 tracking-wider uppercase">美元 \(USD\)<\/span>\s*<span className="text-brand\/80 font-mono text-xl font-bold tracking-tight">\$\{hide\(formatMoney\(earnedToday \/ config\.exchangeRateUsd\)\)\}<\/span>/g,
    `<span className="text-[10px] text-tertiary mb-1 tracking-wider">美元 (USD)</span>\n                      <span className="text-primary font-mono text-2xl font-bold tracking-tight">\${hide(formatMoney(earnedToday / config.exchangeRateUsd))}</span>`
);

// 4. In pomodoro task input layout, fix placeholder
code = code.replace(
     /placeholder="几炷香时间我将完成..."/g,
     'placeholder="今日待办事项..."'
);

// 5. In "双币展示" badge, add some interaction if needed, or make it look better
code = code.replace(
    /<div className="text-\[9px\] bg-card-inner px-2 py-1 rounded flex items-center gap-1 text-tertiary border border-app">双币展示 <ChevronRight size=\{10\} \/><\/div>/g,
    '<div className="text-[10px] bg-brand/10 text-brand px-2 py-1 flex items-center rounded-full gap-1 border border-brand/20 shadow-sm cursor-pointer" onClick={() => setShowUSD(!showUSD)}>双币展示</div>'
);

fs.writeFileSync('src/App.tsx', code);
