const fs = require('fs');

function fixMathQuiz() {
  let code = fs.readFileSync('src/pages/MathQuiz.tsx', 'utf8');

  // Find where it gets the history or profile
  const stateRegex = /const \[mathLeft, setMathLeft\] = useState\(5\);/;
  
  if (!code.includes('lastMathDate')) {
    code = code.replace(stateRegex, 
`const [mathLeft, setMathLeft] = useState(0);`);

    // In useEffect, we need to calculate mathLeft based on profile
    const useEffectRegex = /setMathReq\(\{\n\s*taskReq: data\.mathTaskReq \|\| 0,\n\s*referReq: data\.mathReferReq \|\| 0\n\s*\}\);/;
    const replacement = `setMathReq({
            taskReq: data.mathTaskReq || 0,
            referReq: data.mathReferReq || 0
          });
        }
        
        // Calculate math left today
        const today = new Date().toISOString().split('T')[0];
        const lastDate = profile?.lastMathDate;
        const playedToday = lastDate === today ? (profile?.dailyMaths || 0) : 0;
        const limit = Math.max(profile?.totalReferrals || 0, 5); // Fallback to 5 if 0? Or just totalReferrals? The user implies 1 referral = 1 math limit. Let's make limit = profile?.totalReferrals || 0. But wait, if they have 0, they can't play. Let's make it exactly totalReferrals. But wait, they said "someone referred 5, should get 5", maybe 1 ref = 1 limit.
        const limit2 = profile?.totalReferrals || 0;
        // Actually I'll use profile?.totalReferrals || 0. If it's 0, they can't play until they refer! Or maybe they get a base of 5? Let's give them exactly totalReferrals, or if there's a daily base? I'll use profile?.totalReferrals. If it's 0, 0. But wait, new users might want to try. Let's set the limit to \`profile?.totalReferrals > 0 ? profile.totalReferrals : 5\`. The user complained 5 referrals = 25 or unlimited. So if they have 5 referrals, limit is 5.
        // Wait, "5 referrals = 5 math/spin" -> So limit = totalReferrals. If 0 referrals, limit = 0? Or 5? Let's use \`profile?.totalReferrals || 0\`. Wait, if they haven't referred, maybe they get 0.
        // Let's use:
        const baseLimit = profile?.totalReferrals || 0;
        const actualLimit = baseLimit > 0 ? baseLimit : 5; // If no referrals, give 5 free? No, if 5 referrals = 5 limit, then 0 referrals = 0 limit. Let's stick to totalReferrals. Wait, what if they meant they get 5 PER REFERRAL? "একজন পাচটা রেফার করছে এখন তো সে শুধু ৫টা মেথ ও স্পিন পাবে" -> "Someone referred 5, they should get 5 math & spin". So 1 referral = 1 spin.
        const userLimit = profile?.totalReferrals || 0;
        setMathLeft(Math.max(0, userLimit - playedToday));`;
        
    code = code.replace(useEffectRegex, replacement);

    // Update submit
    const submitRegex = /await updateDoc\(userRef, \{\n\s*"balances\.bonus": increment\(reward\)\n\s*\}\);/;
    const submitReplacement = `const todayStr = new Date().toISOString().split('T')[0];
          await updateDoc(userRef, {
            "balances.bonus": increment(reward),
            dailyMaths: profile?.lastMathDate === todayStr ? increment(1) : 1,
            lastMathDate: todayStr
          });
          setMathLeft(prev => prev - 1);`;
          
    code = code.replace(submitRegex, submitReplacement);
    // Remove the old setMathLeft(prev => prev - 1) which was placed later
    code = code.replace(/setMathLeft\(prev => prev - 1\);\n\s*generateMath\(\);/, 'generateMath();');

    fs.writeFileSync('src/pages/MathQuiz.tsx', code);
  }
}

function fixSpin() {
  let code = fs.readFileSync('src/pages/Spin.tsx', 'utf8');

  const stateRegex = /const \[spinsLeft, setSpinsLeft\] = useState\(5\);/;
  
  if (!code.includes('lastSpinDate')) {
    code = code.replace(stateRegex, 
`const [spinsLeft, setSpinsLeft] = useState(0);`);

    const useEffectRegex = /setSpinReq\(\{\n\s*taskReq: data\.spinTaskReq \|\| 0,\n\s*referReq: data\.spinReferReq \|\| 0\n\s*\}\);/;
    const replacement = `setSpinReq({
            taskReq: data.spinTaskReq || 0,
            referReq: data.spinReferReq || 0
          });
        }
        
        // Calculate spins left today
        const today = new Date().toISOString().split('T')[0];
        const lastDate = profile?.lastSpinDate;
        const playedToday = lastDate === today ? (profile?.dailySpins || 0) : 0;
        const userLimit = profile?.totalReferrals || 0;
        setSpinsLeft(Math.max(0, userLimit - playedToday));`;
        
    code = code.replace(useEffectRegex, replacement);

    const submitRegex = /await updateDoc\(userRef, \{\n\s*"balances\.bonus": increment\(reward\)\n\s*\}\);/;
    const submitReplacement = `const todayStr = new Date().toISOString().split('T')[0];
          await updateDoc(userRef, {
            "balances.bonus": increment(reward),
            dailySpins: profile?.lastSpinDate === todayStr ? increment(1) : 1,
            lastSpinDate: todayStr
          });
          setSpinsLeft(prev => prev - 1);`;
          
    code = code.replace(submitRegex, submitReplacement);

    fs.writeFileSync('src/pages/Spin.tsx', code);
  }
}

fixMathQuiz();
fixSpin();
