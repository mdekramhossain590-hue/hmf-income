const fs = require('fs');
let code = fs.readFileSync('src/pages/GiftCode.tsx', 'utf-8');
code = code.replace(
  "import { Gift, Sparkles } from 'lucide-react';",
  "import { Gift, Sparkles } from 'lucide-react';\nimport { Celebration } from '../components/Celebration';"
);
code = code.replace(
  "const [loading, setLoading] = useState(false);",
  "const [loading, setLoading] = useState(false);\n  const [showCelebration, setShowCelebration] = useState(false);"
);
code = code.replace(
  "triggerRealisticConfetti();",
  "setShowCelebration(true);"
);
code = code.replace(
  '<div className="pt-6 px-4 pb-24 max-w-lg mx-auto">',
  '<div className="pt-6 px-4 pb-24 max-w-lg mx-auto">\n      <Celebration isVisible={showCelebration} onComplete={() => setShowCelebration(false)} />'
);
fs.writeFileSync('src/pages/GiftCode.tsx', code);
