const fs = require('fs');
let code = fs.readFileSync('src/pages/Spin.tsx', 'utf-8');
code = code.replace(
  "import { triggerRealisticConfetti } from '../lib/confetti';",
  "import { Celebration } from '../components/Celebration';"
);
code = code.replace(
  "const [lastSpinDate, setLastSpinDate] = useState<string | null>(null);",
  "const [lastSpinDate, setLastSpinDate] = useState<string | null>(null);\n  const [showCelebration, setShowCelebration] = useState(false);"
);
code = code.replace(
  "triggerRealisticConfetti();",
  "setShowCelebration(true);"
);
code = code.replace(
  '<div className="pt-6 px-4 pb-24 max-w-lg mx-auto">',
  '<div className="pt-6 px-4 pb-24 max-w-lg mx-auto">\n      <Celebration isVisible={showCelebration} onComplete={() => setShowCelebration(false)} />'
);
fs.writeFileSync('src/pages/Spin.tsx', code);
