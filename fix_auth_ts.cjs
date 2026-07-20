const fs = require('fs');
let code = fs.readFileSync('src/pages/Auth.tsx', 'utf8');

code = code.replace(
  `e.formEvent ? e.formEvent.preventDefault() : e.preventDefault();`,
  `e.preventDefault();`
);

fs.writeFileSync('src/pages/Auth.tsx', code);
