import re

with open('src/pages/Admin.tsx', 'r') as f:
    code = f.read()

# 1. Update initial state for withdrawSettings
code = code.replace(
    'customAmounts: "110, 210, 310, 410, 510"',
    'mainAmounts: "110, 210, 310, 410, 510", bonusAmounts: "110, 210, 310, 410, 510", referralAmounts: "110, 210, 310, 410, 510", tasksAmounts: "110, 210, 310, 410, 510"'
)

code = code.replace(
    'customAmounts: d.customAmounts || "110, 210, 310, 410, 510"',
    'mainAmounts: d.mainAmounts || "110, 210, 310, 410, 510", bonusAmounts: d.bonusAmounts || "110, 210, 310, 410, 510", referralAmounts: d.referralAmounts || "110, 210, 310, 410, 510", tasksAmounts: d.tasksAmounts || "110, 210, 310, 410, 510"'
)

# 2. Update Admin UI
target_ui = """            <div className="mt-4 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-3xl space-y-2 ring-1 ring-slate-100 dark:ring-slate-800">
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500 block">Withdraw Option Amounts (৳)</span>
              <p className="text-[9px] text-slate-400 font-bold uppercase leading-tight">Enter comma-separated withdraw amounts that users can select from</p>
              <input 
                type="text" 
                value={withdrawSettings.customAmounts || ""} 
                onChange={(e) => setWithdrawSettings(prev => ({ ...prev, customAmounts: e.target.value }))} 
                className="w-full bg-white dark:bg-slate-800 border-none rounded-xl px-3.5 py-2.5 text-xs font-black tracking-widest text-slate-700 dark:text-white ring-1 ring-slate-100 dark:ring-slate-700" 
                placeholder="110, 210, 310, 410, 510" 
              />
            </div>"""

repl_ui = """            <div className="mt-4 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-3xl space-y-2 ring-1 ring-slate-100 dark:ring-slate-800">
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500 block">Withdraw Option Amounts (৳)</span>
              <p className="text-[9px] text-slate-400 font-bold uppercase leading-tight">Comma-separated withdraw options for each wallet</p>
              
              <div className="space-y-3 mt-3">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Main Wallet Amounts</span>
                  <input type="text" value={withdrawSettings.mainAmounts || ""} onChange={(e) => setWithdrawSettings(prev => ({ ...prev, mainAmounts: e.target.value }))} className="w-full bg-white dark:bg-slate-800 border-none rounded-xl px-3.5 py-2 text-xs font-bold tracking-wider text-slate-700 dark:text-white mt-1" placeholder="110, 210..." />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Bonus Wallet Amounts</span>
                  <input type="text" value={withdrawSettings.bonusAmounts || ""} onChange={(e) => setWithdrawSettings(prev => ({ ...prev, bonusAmounts: e.target.value }))} className="w-full bg-white dark:bg-slate-800 border-none rounded-xl px-3.5 py-2 text-xs font-bold tracking-wider text-slate-700 dark:text-white mt-1" placeholder="110, 210..." />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Referral Wallet Amounts</span>
                  <input type="text" value={withdrawSettings.referralAmounts || ""} onChange={(e) => setWithdrawSettings(prev => ({ ...prev, referralAmounts: e.target.value }))} className="w-full bg-white dark:bg-slate-800 border-none rounded-xl px-3.5 py-2 text-xs font-bold tracking-wider text-slate-700 dark:text-white mt-1" placeholder="110, 210..." />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Tasks Wallet Amounts</span>
                  <input type="text" value={withdrawSettings.tasksAmounts || ""} onChange={(e) => setWithdrawSettings(prev => ({ ...prev, tasksAmounts: e.target.value }))} className="w-full bg-white dark:bg-slate-800 border-none rounded-xl px-3.5 py-2 text-xs font-bold tracking-wider text-slate-700 dark:text-white mt-1" placeholder="110, 210..." />
                </div>
              </div>
            </div>"""

code = code.replace(target_ui, repl_ui)

with open('src/pages/Admin.tsx', 'w') as f:
    f.write(code)

