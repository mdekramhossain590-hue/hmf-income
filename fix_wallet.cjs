const fs = require('fs');
let code = fs.readFileSync('src/pages/Wallet.tsx', 'utf8');

const target = `<div className="grid grid-cols-3 gap-3 mb-4">
           <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-[1.25rem] p-4 text-white shadow-lg shadow-emerald-500/20 relative overflow-hidden border border-emerald-400/30">
             <div className="absolute top-0 left-0 w-20 h-20 bg-white opacity-10 blur-xl rounded-full pointer-events-none"></div>
             <p className="text-[10px] font-bold opacity-90 mb-1 uppercase tracking-widest text-emerald-50 text-center">Bonus</p>
             <h3 className="text-xl font-display font-black tracking-tight text-center">৳ {profile?.balances?.bonus?.toFixed(2) || '0.00'}</h3>
           </div>
           <div className="bg-gradient-to-br from-purple-500 to-violet-600 rounded-[1.25rem] p-4 text-white shadow-lg shadow-purple-500/20 relative overflow-hidden border border-purple-400/30">
             <div className="absolute bottom-0 right-0 w-20 h-20 bg-white opacity-10 blur-xl rounded-full pointer-events-none"></div>
             <p className="text-[10px] font-bold opacity-90 mb-1 uppercase tracking-widest text-purple-50 text-center">Referral</p>
             <h3 className="text-xl font-display font-black tracking-tight text-center">৳ {profile?.balances?.referral?.toFixed(2) || '0.00'}</h3>
           </div>
           <div className="bg-gradient-to-br from-rose-500 to-pink-600 rounded-[1.25rem] p-4 text-white shadow-lg shadow-rose-500/20 relative overflow-hidden border border-rose-400/30">
             <div className="absolute bottom-0 right-0 w-20 h-20 bg-white opacity-10 blur-xl rounded-full pointer-events-none"></div>
             <p className="text-[10px] font-bold opacity-90 mb-1 uppercase tracking-widest text-rose-50 text-center">Gift</p>
             <h3 className="text-xl font-display font-black tracking-tight text-center">৳ {profile?.balances?.gift?.toFixed(2) || '0.00'}</h3>
           </div>
        </div>`;

const replacement = `<div className="grid grid-cols-2 gap-3 mb-4">
           <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-[1.25rem] p-4 text-white shadow-lg shadow-emerald-500/20 relative overflow-hidden border border-emerald-400/30">
             <div className="absolute top-0 left-0 w-20 h-20 bg-white opacity-10 blur-xl rounded-full pointer-events-none"></div>
             <p className="text-[10px] font-bold opacity-90 mb-1 uppercase tracking-widest text-emerald-50 text-center">Bonus</p>
             <h3 className="text-xl font-display font-black tracking-tight text-center">৳ {profile?.balances?.bonus?.toFixed(2) || '0.00'}</h3>
           </div>
           <div className="bg-gradient-to-br from-purple-500 to-violet-600 rounded-[1.25rem] p-4 text-white shadow-lg shadow-purple-500/20 relative overflow-hidden border border-purple-400/30">
             <div className="absolute bottom-0 right-0 w-20 h-20 bg-white opacity-10 blur-xl rounded-full pointer-events-none"></div>
             <p className="text-[10px] font-bold opacity-90 mb-1 uppercase tracking-widest text-purple-50 text-center">Referral</p>
             <h3 className="text-xl font-display font-black tracking-tight text-center">৳ {profile?.balances?.referral?.toFixed(2) || '0.00'}</h3>
           </div>
           <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-[1.25rem] p-4 text-white shadow-lg shadow-amber-500/20 relative overflow-hidden border border-amber-400/30">
             <div className="absolute top-0 right-0 w-20 h-20 bg-white opacity-10 blur-xl rounded-full pointer-events-none"></div>
             <p className="text-[10px] font-bold opacity-90 mb-1 uppercase tracking-widest text-amber-50 text-center">Partner</p>
             <h3 className="text-xl font-display font-black tracking-tight text-center">৳ {profile?.balances?.partner?.toFixed(2) || '0.00'}</h3>
           </div>
           <div className="bg-gradient-to-br from-rose-500 to-pink-600 rounded-[1.25rem] p-4 text-white shadow-lg shadow-rose-500/20 relative overflow-hidden border border-rose-400/30">
             <div className="absolute bottom-0 right-0 w-20 h-20 bg-white opacity-10 blur-xl rounded-full pointer-events-none"></div>
             <p className="text-[10px] font-bold opacity-90 mb-1 uppercase tracking-widest text-rose-50 text-center">Gift</p>
             <h3 className="text-xl font-display font-black tracking-tight text-center">৳ {profile?.balances?.gift?.toFixed(2) || '0.00'}</h3>
           </div>
        </div>`;

if (code.includes('grid-cols-3')) {
  code = code.replace(target, replacement);
  fs.writeFileSync('src/pages/Wallet.tsx', code);
  console.log("Patched Wallet.tsx to show Partner balance");
} else {
  console.log("Not found");
}
