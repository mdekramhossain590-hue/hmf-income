const fs = require('fs');

let actCode = fs.readFileSync('src/pages/ActivityHistory.tsx', 'utf8');

const targetAct = `} else {
              if (isWithdraw) {`;

const repAct = `} else {
              if (activity._originalType === 'partner_bonus') {
                title = language === "Bengali" ? "পার্টনার বোনাস" : "Partner Bonus";
                rewardStr = \`+৳\${displayAmount}\`;
                badgeColor = "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400";
                IconComponent = CheckCircle;
                statusLabel = language === "Bengali" ? "সম্পন্ন" : "Completed";
                statusColor = "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30";
              } else if (activity._originalType === 'activation') {
                title = language === "Bengali" ? "অ্যাকাউন্ট অ্যাক্টিভেশন" : "Account Activation";
                rewardStr = \`-৳\${displayAmount}\`;
                badgeColor = "bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400";
                IconComponent = CheckCircle;
                const aStatus = activity.status || 'completed';
                if (aStatus === 'pending') {
                  statusLabel = language === "Bengali" ? "অপেক্ষমান" : "Pending";
                  statusColor = "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30";
                } else if (aStatus === 'rejected') {
                  statusLabel = language === "Bengali" ? "বাতিল" : "Rejected";
                  statusColor = "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/30";
                } else {
                  statusLabel = language === "Bengali" ? "সম্পন্ন" : "Completed";
                  statusColor = "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/30";
                }
              } else if (activity._originalType === 'gift_claim') {
                title = language === "Bengali" ? "গিফট কোড ক্লেইম" : "Gift Code Claim";
                rewardStr = \`+৳\${displayAmount}\`;
                badgeColor = "bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400";
                IconComponent = CheckCircle;
                statusLabel = language === "Bengali" ? "সম্পন্ন" : "Completed";
                statusColor = "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30";
              } else if (isWithdraw) {`;

actCode = actCode.replace(targetAct, repAct);

fs.writeFileSync('src/pages/ActivityHistory.tsx', actCode);

let wallCode = fs.readFileSync('src/pages/Wallet.tsx', 'utf8');

const wallTarget = `tx.type === 'withdraw' ? 'bg-rose-50 text-rose-500 dark:bg-rose-900/20 dark:text-rose-400' : 'bg-emerald-50 text-emerald-500 dark:bg-emerald-900/20 dark:text-emerald-400'`;
const wallRep = `tx.type === 'withdraw' || tx.type === 'activation' ? 'bg-rose-50 text-rose-500 dark:bg-rose-900/20 dark:text-rose-400' : 'bg-emerald-50 text-emerald-500 dark:bg-emerald-900/20 dark:text-emerald-400'`;
wallCode = wallCode.replace(wallTarget, wallRep);

const wallTarget2 = `{tx.type === 'withdraw' ? <ArrowUpRight className="w-6 h-6" /> : <ArrowDownLeft className="w-6 h-6" />}`;
const wallRep2 = `{tx.type === 'withdraw' || tx.type === 'activation' ? <ArrowUpRight className="w-6 h-6" /> : <ArrowDownLeft className="w-6 h-6" />}`;
wallCode = wallCode.replace(wallTarget2, wallRep2);

const wallTarget3 = `<h4 className="text-sm font-bold text-slate-800 dark:text-white capitalize">{tx.type}</h4>`;
const wallRep3 = `<h4 className="text-sm font-bold text-slate-800 dark:text-white capitalize">{tx.type.replace('_', ' ')}</h4>`;
wallCode = wallCode.replace(wallTarget3, wallRep3);

const wallTarget4 = `tx.type === 'withdraw' ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'`;
const wallRep4 = `tx.type === 'withdraw' || tx.type === 'activation' ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'`;
wallCode = wallCode.replace(wallTarget4, wallRep4);

const wallTarget5 = `{tx.type === 'withdraw' ? '-' : '+'}৳{tx.amount?.toFixed(2)}`;
const wallRep5 = `{tx.type === 'withdraw' || tx.type === 'activation' ? '-' : '+'}৳{tx.amount?.toFixed(2)}`;
wallCode = wallCode.replace(wallTarget5, wallRep5);

fs.writeFileSync('src/pages/Wallet.tsx', wallCode);

console.log("Patched History and Wallet Tx format!");
