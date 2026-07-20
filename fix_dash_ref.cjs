const fs = require('fs');
let code = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

if (!code.includes('import { processRegistrationReferral }')) {
  code = code.replace(
    `import { getCachedQuery } from "../lib/cache";`,
    `import { getCachedQuery } from "../lib/cache";\nimport { processRegistrationReferral } from "../lib/referral";`
  );
  fs.writeFileSync('src/pages/Dashboard.tsx', code);
}
