const fs = require('fs');
let code = fs.readFileSync('src/pages/Admin.tsx', 'utf8');

const bkashReplace = `                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-[#e2136e] flex items-center justify-center text-white text-[10px] font-black">BKASH</div>
                      <div className="flex-1 flex flex-col gap-2">
                        <input type="text" value={depositSettings.bkashNumber} onChange={(e) => setDepositSettings(prev => ({ ...prev, bkashNumber: e.target.value }))} className="w-full bg-white dark:bg-slate-800 border-none rounded-xl px-3 py-2.5 text-sm font-black tracking-widest text-[#e2136e] ring-1 ring-slate-100 dark:ring-slate-700" placeholder="01XXX-XXXXXX" />
                        <input type="text" value={depositSettings.bkashQrUrl || ''} onChange={(e) => setDepositSettings(prev => ({ ...prev, bkashQrUrl: e.target.value }))} className="w-full bg-white dark:bg-slate-800 border-none rounded-xl px-3 py-2.5 text-xs text-slate-500 ring-1 ring-slate-100 dark:ring-slate-700" placeholder="bKash QR Image URL (Optional)" />
                      </div>
                    </div>`;

const nagadReplace = `                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-[#ea232a] flex items-center justify-center text-white text-[10px] font-black">NAGAD</div>
                      <div className="flex-1 flex flex-col gap-2">
                        <input type="text" value={depositSettings.nagadNumber} onChange={(e) => setDepositSettings(prev => ({ ...prev, nagadNumber: e.target.value }))} className="w-full bg-white dark:bg-slate-800 border-none rounded-xl px-3 py-2.5 text-sm font-black tracking-widest text-[#ea232a] ring-1 ring-slate-100 dark:ring-slate-700" placeholder="01XXX-XXXXXX" />
                        <input type="text" value={depositSettings.nagadQrUrl || ''} onChange={(e) => setDepositSettings(prev => ({ ...prev, nagadQrUrl: e.target.value }))} className="w-full bg-white dark:bg-slate-800 border-none rounded-xl px-3 py-2.5 text-xs text-slate-500 ring-1 ring-slate-100 dark:ring-slate-700" placeholder="Nagad QR Image URL (Optional)" />
                      </div>
                    </div>`;

code = code.replace(/<div className="flex items-center gap-4">\s*<div className="w-10 h-10 rounded-2xl bg-\[#e2136e\][^>]+>BKASH<\/div>\s*<input type="text" value=\{depositSettings\.bkashNumber\} [^>]+>\s*<\/div>/, bkashReplace);
code = code.replace(/<div className="flex items-center gap-4">\s*<div className="w-10 h-10 rounded-2xl bg-\[#ea232a\][^>]+>NAGAD<\/div>\s*<input type="text" value=\{depositSettings\.nagadNumber\}[^>]+>\s*<\/div>/, nagadReplace);

fs.writeFileSync('src/pages/Admin.tsx', code);
