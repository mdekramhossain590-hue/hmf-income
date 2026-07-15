const fs = require('fs');
let code = fs.readFileSync('src/pages/Dashboard.tsx', 'utf-8');
code = code.replace(
  '{showActivationPopup && (\n        <Celebration isVisible={showCelebration} onComplete={() => setShowCelebration(false)} />\n      <ActivationPopup onClose={() => setShowActivationPopup(false)} />\n      )}',
  '<Celebration isVisible={showCelebration} onComplete={() => setShowCelebration(false)} />\n      {showActivationPopup && (\n        <ActivationPopup onClose={() => setShowActivationPopup(false)} />\n      )}'
);
fs.writeFileSync('src/pages/Dashboard.tsx', code);
