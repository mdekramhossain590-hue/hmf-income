const fs = require('fs');
let code = fs.readFileSync('src/pages/PostJob.tsx', 'utf-8');
code = code.replace(
  "import { triggerRealisticConfetti } from '../lib/confetti';",
  "import { Celebration } from '../components/Celebration';"
);
code = code.replace(
  "const [error, setError] = useState<string | null>(null);",
  "const [error, setError] = useState<string | null>(null);\n  const [showCelebration, setShowCelebration] = useState(false);"
);
code = code.replace(
  "triggerRealisticConfetti();",
  "setShowCelebration(true);"
);
code = code.replace(
  '<div className="pt-6 px-4 pb-24 max-w-2xl mx-auto">',
  '<div className="pt-6 px-4 pb-24 max-w-2xl mx-auto">\n      <Celebration isVisible={showCelebration} onComplete={() => setShowCelebration(false)} />'
);
fs.writeFileSync('src/pages/PostJob.tsx', code);
