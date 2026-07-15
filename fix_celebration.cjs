const fs = require('fs');
let code = fs.readFileSync('src/components/Celebration.tsx', 'utf-8');
code = code.replace('import { triggerRealisticConfetti } from "../lib/confetti";', 'import { triggerRealisticConfetti } from "../lib/confetti";\nimport { playSuccessSound } from "../lib/sound";');
code = code.replace('triggerRealisticConfetti();', 'triggerRealisticConfetti();\n      playSuccessSound();');
fs.writeFileSync('src/components/Celebration.tsx', code);
