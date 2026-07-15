const fs = require('fs');
let code = fs.readFileSync('src/components/Celebration.tsx', 'utf-8');
code = code.replace(
  '<h3 className="text-sm font-bold text-slate-800 dark:text-white">Success!</h3>',
  '<h3 className="text-sm font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Awesome!</h3>'
);
code = code.replace(
  '<p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Action completed successfully.</p>',
  '<p className="text-xs text-slate-600 dark:text-slate-300 font-bold mt-0.5">Task completed successfully! 🎉</p>'
);
code = code.replace(
  'className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-500 rounded-full flex items-center justify-center shrink-0"',
  'className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-600 text-white rounded-full flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/30"'
);
fs.writeFileSync('src/components/Celebration.tsx', code);
