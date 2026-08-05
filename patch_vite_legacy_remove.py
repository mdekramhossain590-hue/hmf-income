import re

with open('vite.config.ts', 'r') as f:
    code = f.read()

code = code.replace("import legacy from '@vitejs/plugin-legacy';", "")
target = """      legacy({
        targets: ['defaults', 'not IE 11'],
        additionalLegacyPolyfills: ['regenerator-runtime/runtime']
      }),"""
code = code.replace(target, "")

with open('vite.config.ts', 'w') as f:
    f.write(code)

print("Removed legacy plugin from vite.config.ts")
