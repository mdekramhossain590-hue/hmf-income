import re

with open('src/pages/ActivityHistory.tsx', 'r') as f:
    code = f.read()

code = code.replace('\\n        const combined = [', '\n        const combined = [')

with open('src/pages/ActivityHistory.tsx', 'w') as f:
    f.write(code)

