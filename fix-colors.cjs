const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Container adaptation
code = code.replace(/className="w-\[375px\] max-h-screen h-\[720px\] my-6 mx-auto bg-app/g, 'className="w-full h-[100dvh] sm:h-[840px] sm:max-h-[90vh] sm:w-[390px] sm:my-6 mx-auto bg-app sm:border-[8px] sm:rounded-[48px]');
// The initial state for slackSecondsToday
code = code.replace(/useState\(32 \* 60\)/, 'useState(0)');

// Text Colors
code = code.replace(/text-gray-200/g, 'text-primary');
code = code.replace(/text-gray-300/g, 'text-primary');
code = code.replace(/text-white/g, 'text-primary');
code = code.replace(/text-gray-400/g, 'text-secondary');
code = code.replace(/text-gray-500/g, 'text-tertiary');
code = code.replace(/text-\[\#00FF41\]/g, 'text-brand');
code = code.replace(/text-\[\#FF3131\]/g, 'text-red-500');

// Background Colors
code = code.replace(/bg-\[\#0d0d0d\]/g, 'bg-card-inner');
code = code.replace(/bg-\[\#141414\]/g, 'bg-card');
code = code.replace(/bg-\[\#00FF41\]/g, 'bg-brand');
code = code.replace(/bg-\[\#FF3131\]/g, 'bg-red-500');

// Border Colors
code = code.replace(/border-white\/5/g, 'border-app');
code = code.replace(/border-white\/10/g, 'border-app-strong');
code = code.replace(/border-\[\#00FF41\]/g, 'border-brand');
code = code.replace(/border-\[\#FF3131\]/g, 'border-red-500');

// Header visible only on home tab
code = code.replace(/\{\/\* 1\. TOP SMART HEADER \*\/\}/, '{activeTab === \'home\' && (\n      <>\n      {/* 1. TOP SMART HEADER */}');
code = code.replace(/\{\/\* DATE SELECTOR \*\/\}/, '{/* DATE SELECTOR */}\n      </>\n     )}');

// Fix lunar text component
code = code.replace(/<span className="bg-white\/5 px-1\.5 py-0\.5 rounded text-\[9px\] cursor-help" title="按 ESC 键瞬间切换界面">ESC 老板键<\/span>/, '<span className="bg-primary\/5 px-1.5 py-0.5 rounded text-[9px] cursor-help border border-app-strong" title="按 ESC 键瞬间切换界面">ESC 老板键</span>');

fs.writeFileSync('src/App.tsx', code);
