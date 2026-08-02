import re
with open('src/pages/Dashboard.tsx', 'r') as f:
    code = f.read()

code = code.replace('CheckCircle2', 'BadgeCheck')

with open('src/pages/Dashboard.tsx', 'w') as f:
    f.write(code)
