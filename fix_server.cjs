const fs = require('fs');

let serverCode = fs.readFileSync('server.ts', 'utf8');

// Remove static import
serverCode = serverCode.replace('import { createServer as createViteServer } from "vite";\n', '');

// Replace createViteServer usage with dynamic import
serverCode = serverCode.replace(
  'const vite = await createViteServer({',
  'const { createServer: createViteServer } = await import("vite");\n    const vite = await createViteServer({'
);

fs.writeFileSync('server.ts', serverCode);
console.log("Patched server.ts");
