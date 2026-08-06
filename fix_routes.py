import re

with open('server.ts', 'r') as f:
    code = f.read()

# 1. Extract the Vite & static fallback code
fallback_pattern = re.compile(r'  if \(process\.env\.NODE_ENV !== "production"\) \{.*?\n    \}\);\n  \}\n', re.DOTALL)
match = fallback_pattern.search(code)
if not match:
    print("Could not find fallback block.")
    exit(1)

fallback_block = match.group(0)

# 2. Remove it from its current location
code = code.replace(fallback_block, "")

# 3. Insert it right before app.listen
listen_pattern = re.compile(r'  app\.listen\(PORT, "0\.0\.0\.0", \(\) => \{\n    console\.log\(`Server running on http://localhost:\$\{PORT\}`\);\n  \}\);')
if not listen_pattern.search(code):
    print("Could not find listen block.")
    exit(1)

code = code.replace('  app.listen(PORT, "0.0.0.0",', fallback_block + '\n  app.listen(PORT, "0.0.0.0",')

with open('server.ts', 'w') as f:
    f.write(code)

print("Moved Vite middleware to the end!")
