const fs = require('fs');
let code = fs.readFileSync('src/pages/Payment.tsx', 'utf8');

const qrCodeDisplay = `
            {paymentMethod === 'bKash' && depositSettings.bkashQrUrl && (
              <div className="my-3 z-10 bg-white dark:bg-slate-800 p-2 rounded-xl shadow-sm border border-blue-100 dark:border-slate-700 flex flex-col items-center">
                <img src={depositSettings.bkashQrUrl} alt="bKash QR" className="w-32 h-32 object-contain rounded-lg" />
                <p className="text-[10px] text-slate-500 font-bold mt-1 uppercase">Scan to Pay</p>
              </div>
            )}
            {paymentMethod === 'Nagad' && depositSettings.nagadQrUrl && (
              <div className="my-3 z-10 bg-white dark:bg-slate-800 p-2 rounded-xl shadow-sm border border-blue-100 dark:border-slate-700 flex flex-col items-center">
                <img src={depositSettings.nagadQrUrl} alt="Nagad QR" className="w-32 h-32 object-contain rounded-lg" />
                <p className="text-[10px] text-slate-500 font-bold mt-1 uppercase">Scan to Pay</p>
              </div>
            )}
              <p className="text-[10px] text-red-500 font-medium bg-red-50 dark:bg-red-900/30 px-3 py-1 rounded-full">Use SEND MONEY option only</p>`;

code = code.replace(/<p className="text-\[10px\] text-red-500 font-medium bg-red-50 dark:bg-red-900\/30 px-3 py-1 rounded-full">Use SEND MONEY option only<\/p>/, qrCodeDisplay);

fs.writeFileSync('src/pages/Payment.tsx', code);
