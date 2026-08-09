import re

with open('server.ts', 'r') as f:
    code = f.read()

old = """
  const PORT = 3000;
"""
new = """
  const PORT = process.env.PORT || 3000;
"""

code = code.replace(old.strip(), new.strip())

with open('server.ts', 'w') as f:
    f.write(code)

print("patched PORT")
