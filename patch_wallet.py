import re

with open("src/pages/Wallet.tsx", "r") as f:
    code = f.read()

# I will focus on updating the visual layout of the balances and the tabs.
# The balances layout is inside `div className="mb-8"`

new_balances_code = """
      <div className="mb-8 space-y-4">
        <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-3xl p-6 shadow-2xl shadow-indigo-500/10 relative overflow-hidden border border-white/10">
           <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
           <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/20 blur-3xl rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>
           
           <div className="relative z-10">
             <div className="flex justify-between items-start mb-6">
               <div className="flex items-center gap-2">
                 <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/10">
                   <WalletIcon className="w-5 h-5 text-indigo-300" />
                 </div>
                 <div>
                   <p className="text-[10px] font-bold text-indigo-200/70 uppercase tracking-widest">Main Balance</p>
                   <p className="text-sm font-semibold text-white/90">Add Money Wallet</p>
                 </div>
               </div>
               <button onClick={() => navigate('/deposit')} className="bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-lg shadow-indigo-500/25 flex items-center gap-1.5 active:scale-95">
                 Add Funds <ArrowDownLeft className="w-4 h-4" />
               </button>
             </div>
             
             <div className="flex items-end gap-2">
               <span className="text-2xl font-bold text-white/50 mb-1">৳</span>
               <h3 className="text-5xl font-display font-black tracking-tight text-white">{profile?.balances?.main?.toFixed(2) || '0.00'}</h3>
             </div>
           </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
           <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-700/50 hover:scale-[1.02] transition-transform duration-300">
             <div className="flex items-center gap-2 mb-2">
               <div className="w-6 h-6 rounded-md bg-emerald-500/10 flex items-center justify-center">
                 <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
               </div>
               <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Bonus</p>
             </div>
             <h3 className="text-xl font-display font-black tracking-tight text-slate-800 dark:text-white">৳ {profile?.balances?.bonus?.toFixed(2) || '0.00'}</h3>
           </div>
           
           <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-700/50 hover:scale-[1.02] transition-transform duration-300">
             <div className="flex items-center gap-2 mb-2">
               <div className="w-6 h-6 rounded-md bg-purple-500/10 flex items-center justify-center">
                 <ArrowRightLeft className="w-3.5 h-3.5 text-purple-500" />
               </div>
               <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Referral</p>
             </div>
             <h3 className="text-xl font-display font-black tracking-tight text-slate-800 dark:text-white">৳ {profile?.balances?.referral?.toFixed(2) || '0.00'}</h3>
           </div>

           <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-700/50 hover:scale-[1.02] transition-transform duration-300">
             <div className="flex items-center gap-2 mb-2">
               <div className="w-6 h-6 rounded-md bg-amber-500/10 flex items-center justify-center">
                 <Shield className="w-3.5 h-3.5 text-amber-500" />
               </div>
               <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Partner</p>
             </div>
             <h3 className="text-xl font-display font-black tracking-tight text-slate-800 dark:text-white">৳ {profile?.balances?.partner?.toFixed(2) || '0.00'}</h3>
           </div>

           <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-700/50 hover:scale-[1.02] transition-transform duration-300">
             <div className="flex items-center gap-2 mb-2">
               <div className="w-6 h-6 rounded-md bg-rose-500/10 flex items-center justify-center">
                 <Zap className="w-3.5 h-3.5 text-rose-500" />
               </div>
               <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Gift</p>
             </div>
             <h3 className="text-xl font-display font-black tracking-tight text-slate-800 dark:text-white">৳ {profile?.balances?.gift?.toFixed(2) || '0.00'}</h3>
           </div>
        </div>

        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl p-5 shadow-sm border border-slate-100 dark:border-slate-700/50">
          <p className="text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-4 ml-1 uppercase tracking-widest flex items-center gap-2">
            <Zap className="w-4 h-4 text-indigo-500" /> Task Earnings
          </p>
          <div className="flex overflow-x-auto gap-3 pb-2 no-scrollbar px-1 items-center">
            {['Facebook', 'Gmail', 'Instagram', 'Review', 'Sell Accounts', 'Microjob', 'Typing', 'Watch Ads', 'Other'].map((taskName) => {
              const balance = profile?.balances?.tasks?.[taskName] || 0;
              return (
                <div key={taskName} className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-3 min-w-[120px] flex-shrink-0 relative overflow-hidden border border-slate-200 dark:border-slate-700">
                   <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider truncate">{taskName}</p>
                   <h3 className="text-lg font-display font-black tracking-tight text-slate-800 dark:text-white">৳ {balance.toFixed(2)}</h3>
                </div>
              );
            })}
          </div>
        </div>
      </div>
"""

old_balances_pattern = r'<div className="mb-8">.*?<div className="flex bg-slate-200/50'

new_code = re.sub(old_balances_pattern, new_balances_code.strip() + '\n\n      <div className="flex bg-slate-200/50', code, flags=re.DOTALL)

with open("src/pages/Wallet.tsx", "w") as f:
    f.write(new_code)
