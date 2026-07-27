const fs = require('fs');

function fixAdmin(file) {
  let code = fs.readFileSync(file, 'utf8');
  
  // Remove .slice(0, 5) from Admin reviews and requests
  code = code.replace(/submissions\.filter\(s => s\.status !== 'pending'\)\.slice\(0, 5\)\.map/g, "submissions.filter(s => s.status !== 'pending').slice(0, 100).map");
  code = code.replace(/paymentRequests\.filter\(req => req\.status !== 'pending'\)\.slice\(0, 5\)\.map/g, "paymentRequests.filter(req => req.status !== 'pending').slice(0, 100).map");
  
  fs.writeFileSync(file, code);
}

function fixMath(file) {
  let code = fs.readFileSync(file, 'utf8');

  // Replace useEffect for profile
  const oldEffect = `  useEffect(() => {
    if (profile) {
      const today = new Date().toISOString().split('T')[0];
      const userLimit = 5;      
            
      const lastMathDate = profile.lastMathDate;
      const playedMathToday = lastMathDate === today ? (profile.dailyMaths || 0) : 0;
      setMathLeft(Math.max(0, userLimit - playedMathToday));
      
    }
  }, [profile]);`;

  const newEffect = `  const getUnlocks = () => {
    if (!profile) return 0;
    const taskCount = profile.totalTasksCompleted || 0;
    const referCount = profile.totalReferrals || 0;
    
    if (mathReq.taskReq === 0 && mathReq.referReq === 0) return Infinity;
    
    let unlocks = Infinity;
    if (mathReq.taskReq > 0) {
      unlocks = Math.min(unlocks, Math.floor(taskCount / mathReq.taskReq));
    }
    if (mathReq.referReq > 0) {
      unlocks = Math.min(unlocks, Math.floor(referCount / mathReq.referReq));
    }
    return unlocks;
  };

  useEffect(() => {
    if (profile) {
      if (mathReq.taskReq === 0 && mathReq.referReq === 0) {
        setMathLeft(999999);
      } else {
        const totalAllowed = getUnlocks() * 5;
        const totalPlayed = profile.totalMathsPlayed || 0;
        setMathLeft(Math.max(0, totalAllowed - totalPlayed));
      }
    }
  }, [profile, mathReq]);`;

  if (code.includes('const userLimit = 5;')) {
    // try to replace the whole block
    const effectMatch = code.match(/useEffect\(\(\) => \{\s*if\s*\(profile\)\s*\{[\s\S]*?setMathLeft[^\}]*\}\s*\}, \[(profile)?\]\);/);
    if (effectMatch) {
      code = code.replace(effectMatch[0], newEffect);
    }
  }

  // update db updates
  code = code.replace(/dailyMaths:\s*profile\?.lastMathDate === todayStr \? increment\(1\) : 1,\s*lastMathDate:\s*todayStr/g, "totalMathsPlayed: increment(1)");

  // fix html
  code = code.replace(/<span className="text-slate-400">\/ 5<\/span>/g, '');

  fs.writeFileSync(file, code);
}

function fixSpin(file) {
  let code = fs.readFileSync(file, 'utf8');

  const newEffect = `  const getUnlocks = () => {
    if (!profile) return 0;
    const taskCount = profile.totalTasksCompleted || 0;
    const referCount = profile.totalReferrals || 0;
    
    if (spinReq.taskReq === 0 && spinReq.referReq === 0) return Infinity;
    
    let unlocks = Infinity;
    if (spinReq.taskReq > 0) {
      unlocks = Math.min(unlocks, Math.floor(taskCount / spinReq.taskReq));
    }
    if (spinReq.referReq > 0) {
      unlocks = Math.min(unlocks, Math.floor(referCount / spinReq.referReq));
    }
    return unlocks;
  };

  useEffect(() => {
    if (profile) {
      if (spinReq.taskReq === 0 && spinReq.referReq === 0) {
        setSpinsLeft(999999);
      } else {
        const totalAllowed = getUnlocks() * 5;
        const totalPlayed = profile.totalSpinsPlayed || 0;
        setSpinsLeft(Math.max(0, totalAllowed - totalPlayed));
      }
    }
  }, [profile, spinReq]);`;

  const effectMatch = code.match(/useEffect\(\(\) => \{\s*if\s*\(profile\)\s*\{[\s\S]*?setSpinsLeft[^\}]*\}\s*\}, \[(profile)?\]\);/);
  if (effectMatch) {
    code = code.replace(effectMatch[0], newEffect);
  }

  code = code.replace(/dailySpins:\s*profile\?.lastSpinDate === todayStr \? increment\(1\) : 1,\s*lastSpinDate:\s*todayStr/g, "totalSpinsPlayed: increment(1)");

  code = code.replace(/<span className="text-slate-400">\/ 5<\/span>/g, '');

  fs.writeFileSync(file, code);
}

try {
  fixAdmin('src/pages/Admin.tsx');
  fixMath('src/pages/MathQuiz.tsx');
  fixSpin('src/pages/Spin.tsx');
} catch(e) {
  console.log(e);
}

