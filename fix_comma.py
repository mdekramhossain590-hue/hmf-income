import re
with open('src/pages/Dashboard.tsx', 'r') as f:
    code = f.read()

code = code.replace(',\n, BadgeCheck', ',\n  BadgeCheck')
code = code.replace(',\n , BadgeCheck', ',\n  BadgeCheck')
code = code.replace(', , BadgeCheck', ', BadgeCheck')
code = code.replace(',\n  , BadgeCheck', ',\n  BadgeCheck')

with open('src/pages/Dashboard.tsx', 'w') as f:
    f.write(code)
