const fs = require('fs');

function fix(file) {
  let code = fs.readFileSync(file, 'utf8');
  code = code.replace(/<span className="opacity-50">\/ 5<\/span>/g, '<span className="opacity-50">/ {profile?.totalReferrals || 0}</span>');
  fs.writeFileSync(file, code);
}
fix('src/pages/MathQuiz.tsx');
fix('src/pages/Spin.tsx');
