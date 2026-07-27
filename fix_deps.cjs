const fs = require('fs');

function fixDeps(file) {
  let code = fs.readFileSync(file, 'utf8');

  // We should create a separate useEffect to handle profile changes
  const newEffect = `
  useEffect(() => {
    if (profile) {
      const today = new Date().toISOString().split('T')[0];
      
      const lastMathDate = profile.lastMathDate;
      const playedMathToday = lastMathDate === today ? (profile.dailyMaths || 0) : 0;
      
      const lastSpinDate = profile.lastSpinDate;
      const playedSpinToday = lastSpinDate === today ? (profile.dailySpins || 0) : 0;
      
      const userLimit = profile.totalReferrals || 0;
      
      if (typeof setMathLeft === 'function') {
        setMathLeft(Math.max(0, userLimit - playedMathToday));
      }
      if (typeof setSpinsLeft === 'function') {
        setSpinsLeft(Math.max(0, userLimit - playedSpinToday));
      }
    }
  }, [profile]);
`;

  if (!code.includes('playedMathToday')) {
     code = code.replace("const hasMetRequirements", newEffect + "\n  const hasMetRequirements");
     fs.writeFileSync(file, code);
  }
}

fixDeps('src/pages/MathQuiz.tsx');
fixDeps('src/pages/Spin.tsx');
