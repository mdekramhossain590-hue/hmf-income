const fs = require('fs');
let code = fs.readFileSync('src/pages/Spin.tsx', 'utf8');

// I will just replace the exact block using regex
code = code.replace(/try\s*\{\s*if\s*\(reward\s*>\s*0\)\s*\{\s*winSound\(\);\s*const\s*userRef/g, 
  `try {
        const userRef = doc(db, "users", auth.currentUser!.uid);
        const todayStr = new Date().toISOString().split('T')[0];
        
        await updateDoc(userRef, {
           dailySpins: profile?.lastSpinDate === todayStr ? increment(1) : 1,
           lastSpinDate: todayStr
        });
        setSpinsLeft(prev => prev - 1);

        if (reward > 0) {
          winSound();
          const`);

code = code.replace(/await\s*updateDoc\(userRef,\s*\{\s*"balances\.bonus":\s*increment\(reward\),\s*dailySpins:\s*profile\?\.lastSpinDate\s*===\s*todayStr\s*\?\s*increment\(1\)\s*:\s*1,\s*lastSpinDate:\s*todayStr\s*\}\);\s*setSpinsLeft\(prev\s*=>\s*prev\s*-\s*1\);/g, 
  `await updateDoc(userRef, {
            "balances.bonus": increment(reward)
          });`);

fs.writeFileSync('src/pages/Spin.tsx', code);
