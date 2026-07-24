import string

with open('Admin_candidate_4.tsx', 'rb') as f:
    data = f.read()

text = bytes([b for b in data if b in set(string.printable.encode())]).decode('utf-8')

# Find the start
start = text.find("import React")
if start == -1:
    print("Failed to find start")
    exit(1)

export_start = text.find("export function AdminPanel")

imports = text[start:export_start]

with open('src/pages/Admin.tsx', 'r') as f:
    code = f.read()

# Replace the current single import with all imports
code = imports + code[code.find("export function AdminPanel"):]

with open('src/pages/Admin.tsx', 'w') as f:
    f.write(code)

print("Successfully restored imports")
