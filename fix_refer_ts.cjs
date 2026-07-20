const fs = require('fs');
let code = fs.readFileSync('src/pages/Refer.tsx', 'utf8');

code = code.replace(
  `refs.sort((a, b) => {`,
  `refs.sort((a: any, b: any) => {`
);

fs.writeFileSync('src/pages/Refer.tsx', code);
