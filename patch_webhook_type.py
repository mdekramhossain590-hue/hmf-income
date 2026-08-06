import re

with open('server.ts', 'r') as f:
    code = f.read()

old = """
          t.set(transRef, {
            amount: Number(amount),
            type: 'deposit',
            status: 'completed',
"""
new = """
          t.set(transRef, {
            amount: Number(amount),
            type: data.type || 'deposit',
            status: 'completed',
"""

code = code.replace(old.strip(), new.strip())

with open('server.ts', 'w') as f:
    f.write(code)

print("patched webhook type")
