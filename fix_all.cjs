const fs = require('fs');

function fix(file, insertAfter, toInsert) {
  let code = fs.readFileSync(file, 'utf-8');
  if (!code.includes(toInsert)) {
    code = code.replace(insertAfter, insertAfter + '\n' + toInsert);
    fs.writeFileSync(file, code);
  }
}

fix('src/pages/Dashboard.tsx', 'const [partnerSettings, setPartnerSettings] = useState<any>(null);', '  const [showCelebration, setShowCelebration] = useState(false);');
fix('src/pages/PostJob.tsx', 'const [error, setError] = useState<string | null>(null);', '  const [showCelebration, setShowCelebration] = useState(false);');
fix('src/pages/Spin.tsx', 'const [lastSpinDate, setLastSpinDate] = useState<string | null>(null);', '  const [showCelebration, setShowCelebration] = useState(false);');

