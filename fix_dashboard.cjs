const fs = require('fs');
let code = fs.readFileSync('src/pages/Dashboard.tsx', 'utf-8');

if (!code.includes("Clock")) {
  code = code.replace("import {", "import { Clock, XCircle,");
} else {
  if (!code.includes("Clock,")) {
    code = code.replace("import {", "import { Clock, XCircle,");
  }
}
fs.writeFileSync('src/pages/Dashboard.tsx', code);
