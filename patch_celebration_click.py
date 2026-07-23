import re

with open('src/components/Celebration.tsx', 'r') as f:
    code = f.read()

# Make the wrapper clickable to skip
code = code.replace(
    'className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none"',
    'className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-auto bg-black/20 backdrop-blur-sm cursor-pointer" onClick={() => { if(onComplete) onComplete(); }}'
)

with open('src/components/Celebration.tsx', 'w') as f:
    f.write(code)

