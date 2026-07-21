import re

with open('src/pages/Admin.tsx', 'r') as f:
    code = f.read()

# Admin initial state
code = code.replace(
    'tasksAmounts: "110, 210, 310, 410, 510" }',
    'tasksAmounts: "110, 210, 310, 410, 510", partnerAmounts: "110, 210, 310, 410, 510", giftAmounts: "110, 210, 310, 410, 510" }'
)

# Admin fetch
code = code.replace(
    'tasksAmounts: d.tasksAmounts || "110, 210, 310, 410, 510"',
    'tasksAmounts: d.tasksAmounts || "110, 210, 310, 410, 510", partnerAmounts: d.partnerAmounts || "110, 210, 310, 410, 510", giftAmounts: d.giftAmounts || "110, 210, 310, 410, 510"'
)

# Admin UI
target_ui = """                <div>
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Tasks Wallet Amounts</span>
                  <input type="text" value={withdrawSettings.tasksAmounts || ""} onChange={(e) => setWithdrawSettings(prev => ({ ...prev, tasksAmounts: e.target.value }))} className="w-full bg-white dark:bg-slate-800 border-none rounded-xl px-3.5 py-2 text-xs font-bold tracking-wider text-slate-700 dark:text-white mt-1" placeholder="110, 210..." />
                </div>
              </div>"""

repl_ui = """                <div>
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Partner Wallet Amounts</span>
                  <input type="text" value={withdrawSettings.partnerAmounts || ""} onChange={(e) => setWithdrawSettings(prev => ({ ...prev, partnerAmounts: e.target.value }))} className="w-full bg-white dark:bg-slate-800 border-none rounded-xl px-3.5 py-2 text-xs font-bold tracking-wider text-slate-700 dark:text-white mt-1" placeholder="110, 210..." />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Gift Wallet Amounts</span>
                  <input type="text" value={withdrawSettings.giftAmounts || ""} onChange={(e) => setWithdrawSettings(prev => ({ ...prev, giftAmounts: e.target.value }))} className="w-full bg-white dark:bg-slate-800 border-none rounded-xl px-3.5 py-2 text-xs font-bold tracking-wider text-slate-700 dark:text-white mt-1" placeholder="110, 210..." />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Tasks Wallet Amounts</span>
                  <input type="text" value={withdrawSettings.tasksAmounts || ""} onChange={(e) => setWithdrawSettings(prev => ({ ...prev, tasksAmounts: e.target.value }))} className="w-full bg-white dark:bg-slate-800 border-none rounded-xl px-3.5 py-2 text-xs font-bold tracking-wider text-slate-700 dark:text-white mt-1" placeholder="110, 210..." />
                </div>
              </div>"""

code = code.replace(target_ui, repl_ui)

with open('src/pages/Admin.tsx', 'w') as f:
    f.write(code)


with open('src/pages/Wallet.tsx', 'r') as f:
    code = f.read()

# Wallet initial state
code = code.replace(
    'tasksAmounts: "110, 210, 310, 410, 510" }',
    'tasksAmounts: "110, 210, 310, 410, 510", partnerAmounts: "110, 210, 310, 410, 510", giftAmounts: "110, 210, 310, 410, 510" }'
)

# Wallet fetch
code = code.replace(
    'tasksAmounts: data.tasksAmounts || "110, 210, 310, 410, 510"',
    'tasksAmounts: data.tasksAmounts || "110, 210, 310, 410, 510", partnerAmounts: data.partnerAmounts || "110, 210, 310, 410, 510", giftAmounts: data.giftAmounts || "110, 210, 310, 410, 510"'
)

# Wallet options selection
target_options = """                if (selectedWallet === 'main') optionsString = withdrawSettings.mainAmounts || optionsString;
                else if (selectedWallet === 'bonus') optionsString = withdrawSettings.bonusAmounts || optionsString;
                else if (selectedWallet === 'referral') optionsString = withdrawSettings.referralAmounts || optionsString;
                else if (selectedWallet === 'tasks') optionsString = withdrawSettings.tasksAmounts || optionsString;"""

repl_options = """                const taskWallets = ['Facebook', 'Gmail', 'Instagram', 'Review', 'Sell Accounts', 'Microjob', 'Typing', 'Watch Ads', 'Other'];
                if (selectedWallet === 'main') optionsString = withdrawSettings.mainAmounts || optionsString;
                else if (selectedWallet === 'bonus') optionsString = withdrawSettings.bonusAmounts || optionsString;
                else if (selectedWallet === 'referral') optionsString = withdrawSettings.referralAmounts || optionsString;
                else if (selectedWallet === 'partner') optionsString = withdrawSettings.partnerAmounts || optionsString;
                else if (selectedWallet === 'gift') optionsString = withdrawSettings.giftAmounts || optionsString;
                else if (taskWallets.includes(selectedWallet) || selectedWallet === 'tasks') optionsString = withdrawSettings.tasksAmounts || optionsString;"""

code = code.replace(target_options, repl_options)

with open('src/pages/Wallet.tsx', 'w') as f:
    f.write(code)

