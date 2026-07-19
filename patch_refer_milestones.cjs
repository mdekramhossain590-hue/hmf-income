const fs = require('fs');
let code = fs.readFileSync('src/pages/Refer.tsx', 'utf8');

const milestoneComponent = `      {/* Milestones Progress Bar */}
      <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700/50 mb-6 text-left">
        <h3 className="text-sm font-black text-slate-800 dark:text-white mb-4 tracking-tight flex items-center justify-between">
          <span>Reward Milestones</span>
          <span className="text-[10px] bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-2 py-1 rounded-lg uppercase tracking-wider">
            {totalReferralsCount} Referrals
          </span>
        </h3>
        
        <div className="space-y-5">
          {[
            { target: 10, reward: '৳50 Bonus' },
            { target: 50, reward: '৳300 Bonus' },
            { target: 100, reward: '৳1000 Bonus' }
          ].map((milestone, idx) => {
            const progress = Math.min(100, (totalReferralsCount / milestone.target) * 100);
            const isCompleted = totalReferralsCount >= milestone.target;
            
            return (
              <div key={idx} className="relative">
                <div className="flex justify-between items-end mb-2">
                  <span className={\`text-xs font-bold \${isCompleted ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500'}\`}>
                    {milestone.target} Referrals
                  </span>
                  <span className={\`text-[10px] font-black uppercase tracking-widest \${isCompleted ? 'text-green-500' : 'text-amber-500'}\`}>
                    {isCompleted ? 'Completed' : milestone.reward}
                  </span>
                </div>
                <div className="h-3 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div 
                    className={\`h-full rounded-full transition-all duration-1000 ease-out \${isCompleted ? 'bg-gradient-to-r from-green-400 to-emerald-500' : 'bg-gradient-to-r from-indigo-500 to-purple-500'}\`}
                    style={{ width: \`\${progress}%\` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl ring-1 ring-indigo-100 dark:ring-indigo-500/20`;

code = code.replace(
  `<div className="bg-white dark:bg-slate-800 p-4 rounded-2xl ring-1 ring-indigo-100 dark:ring-indigo-500/20`,
  milestoneComponent
);

fs.writeFileSync('src/pages/Refer.tsx', code);
console.log("Patched Refer Milestones");
