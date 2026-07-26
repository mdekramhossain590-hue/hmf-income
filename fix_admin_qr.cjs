const fs = require('fs');
let code = fs.readFileSync('src/pages/Admin.tsx', 'utf8');

const oldWithdrawAccount = `                        <span className="font-mono font-bold text-slate-700 dark:text-slate-200 tracking-wider text-[11px]">{req.account}</span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(req.account);
                            toast.success('Account copied!');
                          }}
                          className="hover:text-indigo-500 text-slate-400 transition p-0.5 rounded cursor-pointer active:scale-95"
                          title="Copy Account Number"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                    </div>`;

const newWithdrawAccount = `                        <span className="font-mono font-bold text-slate-700 dark:text-slate-200 tracking-wider text-[11px]">{req.account}</span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(req.account);
                            toast.success('Account copied!');
                          }}
                          className="hover:text-indigo-500 text-slate-400 transition p-0.5 rounded cursor-pointer active:scale-95"
                          title="Copy Account Number"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    <div className="flex justify-center mt-3 p-2 bg-white rounded-lg w-fit mx-auto">
                      <QRCode value={req.account} size={90} />
                    </div>`;

code = code.replace(oldWithdrawAccount, newWithdrawAccount);

fs.writeFileSync('src/pages/Admin.tsx', code);
