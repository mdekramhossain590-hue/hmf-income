const fs = require('fs');
let code = fs.readFileSync('src/pages/Admin.tsx', 'utf8');

const badBlock = `                  <button
                    onClick={() => {
                      setEditingUserBalance({
                        id: user.id,
                        fullName: user.fullName || 'Anonymous',
                        main: Number(user.balances?.main || 0),
                        bonus: Number(user.balances?.bonus || 0),
                        referral: Number(user.balances?.referral || 0),
                        partner: Number(user.balances?.partner || 0),
                        tasks: Number(Object.values(user.balances?.tasks || {}).reduce((a: any, b: any) => Number(a || 0) + Number(b || 0), 0))
                      });
                    }}
                    className="flex items-center gap-2 px-6 py-3 rounded-2xl font-black uppercase tracking-[0.1em] text-[10px] transition-all active:scale-95 bg-emerald-100 text-emerald-600 shadow-lg shadow-emerald-500/10 hover:bg-emerald-200"
                  >
                    <Settings className="w-4 h-4" /> Edit Balance
                  </button>`;

code = code.replace(badBlock, '');
fs.writeFileSync('src/pages/Admin.tsx', code);
