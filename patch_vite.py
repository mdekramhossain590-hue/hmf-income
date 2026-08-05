import re

with open('vite.config.ts', 'r') as f:
    code = f.read()

if "import legacy" not in code:
    code = "import legacy from '@vitejs/plugin-legacy';\n" + code

code = code.replace("plugins: [", "plugins: [\n      legacy({ targets: ['defaults', 'not IE 11'] }),")

with open('vite.config.ts', 'w') as f:
    f.write(code)

