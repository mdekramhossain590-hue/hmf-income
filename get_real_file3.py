import string

with open("Admin_candidate_4.tsx", "rb") as f:
    data = f.read()

printable = set(string.printable.encode())
filtered = bytes([b for b in data if b in printable])
text = filtered.decode('utf-8')

export_start = text.find("export function AdminPanel")
if export_start == -1:
    print("Export not found")
    exit(1)

import_start = text.rfind("import ", 0, export_start)

brace_count = 0
in_component = False

for i in range(export_start, len(text)):
    if text[i] == '{':
        brace_count += 1
        in_component = True
    elif text[i] == '}':
        brace_count -= 1
        if in_component and brace_count == 0:
            print(f"End found at {i}")
            with open("src/pages/Admin.tsx", "w") as out:
                out.write(text[import_start:i+1] + "\n")
            print("Successfully extracted src/pages/Admin.tsx")
            break
