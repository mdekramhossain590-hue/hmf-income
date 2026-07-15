const fs = require('fs');
let code = fs.readFileSync('src/pages/Dashboard.tsx', 'utf-8');
code = code.replace(
  'import { ActivationPopup } from "../components/ActivationPopup";',
  'import { ActivationPopup } from "../components/ActivationPopup";\nimport { Celebration } from "../components/Celebration";'
);
code = code.replace(
  'const [partnerSettings, setPartnerSettings] = useState<any>(null);',
  'const [partnerSettings, setPartnerSettings] = useState<any>(null);\n  const [showCelebration, setShowCelebration] = useState(false);'
);
code = code.replace(
  'triggerRealisticConfetti();',
  'setShowCelebration(true);'
);
code = code.replace(
  '<ActivationPopup',
  '<Celebration isVisible={showCelebration} onComplete={() => setShowCelebration(false)} />\n      <ActivationPopup'
);
fs.writeFileSync('src/pages/Dashboard.tsx', code);
