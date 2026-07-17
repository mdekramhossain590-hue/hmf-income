const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace("  // Proxy route for database API\n      }\n  });\n\n  // API route for AI support", "  // API route for AI support");

fs.writeFileSync('server.ts', code);
