import re

with open('server.ts', 'r') as f:
    code = f.read()

old = """
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
"""
new = """
  app.listen(PORT as number, () => {
    console.log(`Server running on port ${PORT}`);
  });
"""

code = code.replace(old.strip(), new.strip())

with open('server.ts', 'w') as f:
    f.write(code)

print("patched listen")
