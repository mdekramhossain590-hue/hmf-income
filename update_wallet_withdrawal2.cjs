const fs = require('fs');
let code = fs.readFileSync('src/pages/Wallet.tsx', 'utf8');

const formReplacement = `            <div>
              <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest pl-1 mb-1.5">{t('select_method') || 'Method'}</label>
              <div className="flex gap-4">
                {depositSettings.bkashEnabled !== false && (
                  <button
                    type="button"
                    onClick={() => setWithdrawMethod('bKash')}
                    className={\`flex-1 py-3 px-2 rounded-xl flex flex-col items-center justify-center gap-2 border-2 transition-all \${withdrawMethod === 'bKash' ? 'border-[#E2136E] bg-[#E2136E]/10 scale-105' : 'border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700'}\`}
                  >
                    <img src="https://freelogopng.com/images/all_img/1656234745bkash-app-logo-png.png" alt="bKash" className="h-8 object-contain" />
                    <span className="text-xs font-bold dark:text-white">bKash</span>
                  </button>
                )}
                {depositSettings.nagadEnabled !== false && (
                  <button
                    type="button"
                    onClick={() => setWithdrawMethod('Nagad')}
                    className={\`flex-1 py-3 px-2 rounded-xl flex flex-col items-center justify-center gap-2 border-2 transition-all \${withdrawMethod === 'Nagad' ? 'border-[#F7931E] bg-[#F7931E]/10 scale-105' : 'border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700'}\`}
                  >
                    <img src="https://freelogopng.com/images/all_img/1679248787Nagad-Logo.png" alt="Nagad" className="h-8 object-contain" />
                    <span className="text-xs font-bold dark:text-white">Nagad</span>
                  </button>
                )}
              </div>
            </div>`;

code = code.replace(
  /<div>\s*<label className="block text-\[11px\] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest pl-1 mb-1.5">\{t\('select_method'\) \|\| 'Method'\}<\/label>\s*<div className="flex gap-4">\s*<button[\s\S]*?<\/button>\s*<\/div>\s*<\/div>/,
  formReplacement
);

fs.writeFileSync('src/pages/Wallet.tsx', code);
