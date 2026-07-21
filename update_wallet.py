import re

with open('src/pages/Wallet.tsx', 'r') as f:
    code = f.read()

# Update initial state
code = code.replace(
    'customAmounts: "110, 210, 310, 410, 510"',
    'mainAmounts: "110, 210, 310, 410, 510", bonusAmounts: "110, 210, 310, 410, 510", referralAmounts: "110, 210, 310, 410, 510", tasksAmounts: "110, 210, 310, 410, 510"'
)
code = code.replace(
    'customAmounts: data.customAmounts || "110, 210, 310, 410, 510"',
    'mainAmounts: data.mainAmounts || "110, 210, 310, 410, 510", bonusAmounts: data.bonusAmounts || "110, 210, 310, 410, 510", referralAmounts: data.referralAmounts || "110, 210, 310, 410, 510", tasksAmounts: data.tasksAmounts || "110, 210, 310, 410, 510"'
)

# Update Amount Options block
target_options = """              {(() => {
                const amountOptions = (withdrawSettings.customAmounts || "110, 210, 310, 410, 510")
                  .split(',')
                  .map(s => s.trim())
                  .filter(Boolean);

                return (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {amountOptions.map((opt) => {
                        const isSelected = withdrawAmount === opt;
                        return (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => setWithdrawAmount(opt)}
                            className={`py-3 px-4 rounded-2xl border text-sm font-black transition-all duration-200 flex items-center justify-center gap-1.5 shadow-sm active:scale-95 ${
                              isSelected 
                                ? 'bg-indigo-600 border-indigo-600 text-white font-black shadow-md shadow-indigo-500/10' 
                                : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-indigo-400 dark:hover:border-indigo-500'
                            }`}
                          >
                            <span className="text-sm font-extrabold">{opt}</span>
                            <span className="text-xs font-normal">৳</span>
                          </button>
                        );
                      })}
                      
                      {/* Custom Amount option button */}
                      <button
                        type="button"
                        onClick={() => {
                          const customInput = prompt("Enter custom amount (৳):");
                          if (customInput && !isNaN(parseFloat(customInput))) {
                            setWithdrawAmount(parseFloat(customInput).toString());
                          }
                        }}
                        className={`py-3 px-4 rounded-2xl border text-xs font-black transition-all duration-205 flex items-center justify-center gap-1 shadow-sm active:scale-95 ${
                          withdrawAmount && !amountOptions.includes(withdrawAmount)
                            ? 'bg-indigo-600 border-indigo-600 text-white font-black shadow-md' 
                            : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:border-indigo-400'
                        }`}
                      >
                        {withdrawAmount && !amountOptions.includes(withdrawAmount) ? (
                          <span className="font-extrabold">{withdrawAmount} ৳</span>
                        ) : (
                          <span>অন্যান্য পরিমাণ</span>
                        )}
                      </button>
                    </div>"""

repl_options = """              {(() => {
                let optionsString = "110, 210, 310, 410, 510";
                if (selectedWallet === 'main') optionsString = withdrawSettings.mainAmounts || optionsString;
                else if (selectedWallet === 'bonus') optionsString = withdrawSettings.bonusAmounts || optionsString;
                else if (selectedWallet === 'referral') optionsString = withdrawSettings.referralAmounts || optionsString;
                else if (selectedWallet === 'tasks') optionsString = withdrawSettings.tasksAmounts || optionsString;

                const amountOptions = optionsString
                  .split(',')
                  .map(s => s.trim())
                  .filter(Boolean);

                return (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {amountOptions.map((opt) => {
                        const isSelected = withdrawAmount === opt;
                        return (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => setWithdrawAmount(opt)}
                            className={`py-3 px-4 rounded-2xl border text-sm font-black transition-all duration-200 flex items-center justify-center gap-1.5 shadow-sm active:scale-95 ${
                              isSelected 
                                ? 'bg-indigo-600 border-indigo-600 text-white font-black shadow-md shadow-indigo-500/10' 
                                : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-indigo-400 dark:hover:border-indigo-500'
                            }`}
                          >
                            <span className="text-sm font-extrabold">{opt}</span>
                            <span className="text-xs font-normal">৳</span>
                          </button>
                        );
                      })}
                    </div>"""

code = code.replace(target_options, repl_options)

with open('src/pages/Wallet.tsx', 'w') as f:
    f.write(code)

