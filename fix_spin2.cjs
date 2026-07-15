const fs = require('fs');
let code = fs.readFileSync('src/pages/Spin.tsx', 'utf-8');

// Remove from Confetti
code = code.replace(
  '<Celebration isVisible={showCelebration} onComplete={() => setShowCelebration(false)} />',
  ''
);

// Inject into Spin's main return
code = code.replace(
  '<div className="pt-6 px-4 pb-24 max-w-lg mx-auto">',
  '<div className="pt-6 px-4 pb-24 max-w-lg mx-auto">\n      <Celebration isVisible={showCelebration} onComplete={() => setShowCelebration(false)} />'
);

fs.writeFileSync('src/pages/Spin.tsx', code);
