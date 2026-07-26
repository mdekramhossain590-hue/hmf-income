const fs = require('fs');
let code = fs.readFileSync('src/pages/Refer.tsx', 'utf8');

const historyHeaderOld = `      <div className="text-left">
        <h4 className="font-bold text-slate-800 dark:text-white mb-3 flex items-center gap-2 tracking-tight">
          <div className="p-1.5 bg-slate-100 dark:bg-slate-700 rounded-lg text-indigo-500"><History className="w-4 h-4" /></div> {t('referral_history')}
        </h4>
        
        <div className="space-y-3">
          {referrals.length === 0 ? (
            <div className="text-center py-6 text-slate-400 bg-white dark:bg-slate-800 rounded-2xl ring-1 ring-slate-100 dark:ring-slate-700/50 font-medium text-sm">
              <p className="text-sm">{t('no_referrals_yet')}</p>
            </div>
          ) : (
            referrals.map((ref) => (`;

const historyHeaderNew = `      <div className="text-left">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
          <h4 className="font-bold text-slate-800 dark:text-white flex items-center gap-2 tracking-tight">
            <div className="p-1.5 bg-slate-100 dark:bg-slate-700 rounded-lg text-indigo-500"><History className="w-4 h-4" /></div> {t('referral_history')}
          </h4>
          <div className="flex bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-1 rounded-xl w-fit">
            {[1, 2, 3].map((gen) => (
              <button
                key={gen}
                onClick={() => setHistoryTab(gen)}
                className={\`px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all \${
                  historyTab === gen
                    ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }\`}
              >
                Gen {gen}
              </button>
            ))}
          </div>
        </div>
        
        <div className="space-y-3">
          {referrals.filter(r => (historyTab === 1 ? (!r.level || r.level === 1) : r.level === historyTab)).length === 0 ? (
            <div className="text-center py-6 text-slate-400 bg-white dark:bg-slate-800 rounded-2xl ring-1 ring-slate-100 dark:ring-slate-700/50 font-medium text-sm">
              <p className="text-sm">{t('no_referrals_yet')}</p>
            </div>
          ) : (
            referrals.filter(r => (historyTab === 1 ? (!r.level || r.level === 1) : r.level === historyTab)).map((ref) => (`;

code = code.replace(historyHeaderOld, historyHeaderNew);
fs.writeFileSync('src/pages/Refer.tsx', code);
