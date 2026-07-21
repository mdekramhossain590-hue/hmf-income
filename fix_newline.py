import re

with open('src/pages/Dashboard.tsx', 'r') as f:
    code = f.read()

code = code.replace('\\n  const getCombinedActivity = () => {', '\n  const getCombinedActivity = () => {')

with open('src/pages/Dashboard.tsx', 'w') as f:
    f.write(code)

