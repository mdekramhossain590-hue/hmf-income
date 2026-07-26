const fs = require('fs');
let code = fs.readFileSync('src/pages/Payment.tsx', 'utf8');

if (!code.includes('import QRCode from "react-qr-code"')) {
    code = code.replace(/import \{ ([^}]+) \} from 'lucide-react';/, "import { $1 } from 'lucide-react';\nimport QRCode from 'react-qr-code';");
}

const oldQr = `
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
            )}`;

const newQr = `
            {paymentMethod === 'bKash' && depositSettings.bkashNumber && (
              <div className="my-3 z-10 bg-white dark:bg-slate-800 p-3 rounded-xl shadow-sm border border-blue-100 dark:border-slate-700 flex flex-col items-center">
                <div className="bg-white p-2 rounded-lg">
                  <QRCode value={depositSettings.bkashNumber} size={120} />
                </div>
                <p className="text-[10px] text-slate-500 font-bold mt-2 uppercase">Scan to Pay</p>
              </div>
            )}
            {paymentMethod === 'Nagad' && depositSettings.nagadNumber && (
              <div className="my-3 z-10 bg-white dark:bg-slate-800 p-3 rounded-xl shadow-sm border border-blue-100 dark:border-slate-700 flex flex-col items-center">
                <div className="bg-white p-2 rounded-lg">
                  <QRCode value={depositSettings.nagadNumber} size={120} />
                </div>
                <p className="text-[10px] text-slate-500 font-bold mt-2 uppercase">Scan to Pay</p>
              </div>
            )}`;

code = code.replace(oldQr, newQr);
fs.writeFileSync('src/pages/Payment.tsx', code);
