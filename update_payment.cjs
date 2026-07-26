const fs = require('fs');
let code = fs.readFileSync('src/pages/Payment.tsx', 'utf8');

code = code.replace(
  "import { ShieldCheck, ArrowRight, CreditCard } from 'lucide-react';",
  "import { ShieldCheck, ArrowRight, CreditCard, Copy } from 'lucide-react';"
);

const headerReplacement = `            <div className="bg-blue-50 border border-blue-200 dark:bg-blue-900/20 dark:border-blue-800 p-4 rounded-xl mb-6 flex flex-col items-center">
              <p className="text-xs text-gray-600 dark:text-gray-300">Send money directly to this number via {paymentMethod || 'bKash/Nagad'}:</p>
              <div className="flex items-center gap-3 my-2 z-10 bg-white dark:bg-slate-800 py-2 px-4 rounded-xl shadow-sm border border-blue-100 dark:border-slate-700">
                <h3 className="text-xl font-bold text-[#0D47A1] dark:text-blue-400 tracking-wider">
                  {paymentMethod === 'bKash' ? depositSettings.bkashNumber : paymentMethod === 'Nagad' ? depositSettings.nagadNumber : 'Select a method below'}
                </h3>
                {(paymentMethod === 'bKash' || paymentMethod === 'Nagad') && (
                  <button
                    type="button"
                    onClick={() => {
                      const num = paymentMethod === 'bKash' ? depositSettings.bkashNumber : depositSettings.nagadNumber;
                      navigator.clipboard.writeText(num);
                      toast.success('Number copied!');
                    }}
                    className="p-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors dark:bg-blue-800/40 dark:text-blue-300 dark:hover:bg-blue-800/60 active:scale-95"
                    title="Copy Number"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                )}
              </div>
              <p className="text-[10px] text-red-500 font-medium bg-red-50 dark:bg-red-900/30 px-3 py-1 rounded-full">Use SEND MONEY option only</p>
            </div>`;

code = code.replace(
  /<div className="bg-blue-50 border border-blue-200 dark:bg-blue-900\/20 dark:border-blue-800 p-4 rounded-xl mb-6 text-center">[\s\S]*?<\/div>/,
  headerReplacement
);

const formReplacement = `              <div>
                <label className="text-xs font-bold text-gray-500 block mb-2">Payment Method</label>
                <div className="flex gap-4">
                  {depositSettings.bkashEnabled !== false && (
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('bKash')}
                      className={\`flex-1 py-3 px-2 rounded-xl flex flex-col items-center justify-center gap-2 border-2 transition-all \${paymentMethod === 'bKash' ? 'border-[#E2136E] bg-[#E2136E]/10 scale-105' : 'border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700'}\`}
                    >
                      <img src="https://freelogopng.com/images/all_img/1656234745bkash-app-logo-png.png" alt="bKash" className="h-8 object-contain" />
                      <span className="text-xs font-bold dark:text-white">bKash</span>
                    </button>
                  )}
                  {depositSettings.nagadEnabled !== false && (
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('Nagad')}
                      className={\`flex-1 py-3 px-2 rounded-xl flex flex-col items-center justify-center gap-2 border-2 transition-all \${paymentMethod === 'Nagad' ? 'border-[#F7931E] bg-[#F7931E]/10 scale-105' : 'border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700'}\`}
                    >
                      <img src="https://freelogopng.com/images/all_img/1679248787Nagad-Logo.png" alt="Nagad" className="h-8 object-contain" />
                      <span className="text-xs font-bold dark:text-white">Nagad</span>
                    </button>
                  )}
                </div>
              </div>`;

code = code.replace(
  /<div>\s*<label className="text-xs font-bold text-gray-500 block mb-1">Payment Method<\/label>\s*<select[\s\S]*?<\/select>\s*<\/div>/,
  formReplacement
);

fs.writeFileSync('src/pages/Payment.tsx', code);
