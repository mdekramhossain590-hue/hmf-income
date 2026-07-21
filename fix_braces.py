import re

with open('src/pages/Dashboard.tsx', 'r') as f:
    code = f.read()

code = code.replace('} else if (isTask) { {', '} else if (isTask) {')

with open('src/pages/Dashboard.tsx', 'w') as f:
    f.write(code)

