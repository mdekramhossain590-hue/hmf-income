const fs = require('fs');
const files = [
  'src/pages/PostJob.tsx',
  'src/pages/Spin.tsx',
  'src/pages/MathQuiz.tsx',
  'src/pages/GiftCode.tsx'
];

for (const file of files) {
  let code = fs.readFileSync(file, 'utf-8');
  if (!code.includes('<Celebration isVisible={showCelebration}')) {
    // Find the first <div className="pt-6 px-4
    // or return (
    const returnIndex = code.indexOf('return (');
    if (returnIndex !== -1) {
      const nextDiv = code.indexOf('<div', returnIndex);
      if (nextDiv !== -1) {
        const closeTag = code.indexOf('>', nextDiv);
        const toInject = '\n      <Celebration isVisible={showCelebration} onComplete={() => setShowCelebration(false)} />';
        code = code.slice(0, closeTag + 1) + toInject + code.slice(closeTag + 1);
        fs.writeFileSync(file, code);
      }
    }
  }
}
