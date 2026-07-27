const fs = require('fs');
function fix(file) {
  let code = fs.readFileSync(file, 'utf8');
  // Remove the extra stuff I added in the first replace that caused syntax error
  const removeRegex = /\/\/ Calculate math left today[\s\S]*?setMathLeft\(Math\.max\(0, userLimit - playedToday\)\);\n\s*\}/;
  if (code.match(removeRegex)) {
    code = code.replace(removeRegex, '}');
    fs.writeFileSync(file, code);
  }
}
fix('src/pages/MathQuiz.tsx');

function fixSpin(file) {
  let code = fs.readFileSync(file, 'utf8');
  // Remove the extra stuff I added in the first replace that caused syntax error
  const removeRegex = /\/\/ Calculate spins left today[\s\S]*?setSpinsLeft\(Math\.max\(0, userLimit - playedToday\)\);\n\s*\}/;
  if (code.match(removeRegex)) {
    code = code.replace(removeRegex, '}');
    fs.writeFileSync(file, code);
  }
}
fixSpin('src/pages/Spin.tsx');
