const fs = require('fs');

function fixSyntax(file) {
  let code = fs.readFileSync(file, 'utf8');
  code = code.replace(/}\s*\}\s*\} catch/g, '} } catch');
  fs.writeFileSync(file, code);
}
fixSyntax('src/pages/MathQuiz.tsx');
fixSyntax('src/pages/Spin.tsx');
