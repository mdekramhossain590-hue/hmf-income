const fs = require('fs');

function fixVars(file, isSpin) {
  let code = fs.readFileSync(file, 'utf8');

  const oldEffect = `  useEffect(() => {
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
  }, [profile]);`;

  const newEffect = `  useEffect(() => {
    if (profile) {
      const today = new Date().toISOString().split('T')[0];
      const userLimit = profile.totalReferrals || 0;
      
      ${isSpin ? `
      const lastSpinDate = profile.lastSpinDate;
      const playedSpinToday = lastSpinDate === today ? (profile.dailySpins || 0) : 0;
      setSpinsLeft(Math.max(0, userLimit - playedSpinToday));
      ` : `
      const lastMathDate = profile.lastMathDate;
      const playedMathToday = lastMathDate === today ? (profile.dailyMaths || 0) : 0;
      setMathLeft(Math.max(0, userLimit - playedMathToday));
      `}
    }
  }, [profile]);`;

  code = code.replace(oldEffect, newEffect);
  fs.writeFileSync(file, code);
}

fixVars('src/pages/Spin.tsx', true);
fixVars('src/pages/MathQuiz.tsx', false);
