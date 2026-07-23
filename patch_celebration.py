import re

with open('src/components/Celebration.tsx', 'r') as f:
    code = f.read()

# Replace the useEffect dependency array
code = code.replace(
    '}, [isVisible, onComplete]);',
    '}, [isVisible]);'
)

with open('src/components/Celebration.tsx', 'w') as f:
    f.write(code)

