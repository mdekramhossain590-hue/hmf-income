import string

with open("Admin_candidate_4.tsx", "rb") as f:
    data = f.read()

printable = set(string.printable.encode())
filtered = bytes([b for b in data if b in printable])
text = filtered.decode('utf-8')

start = text.find("import React")
export_start = text.find("export function AdminPanel")

if start == -1 or export_start == -1:
    print("Not found")
    exit(1)

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
                out.write(text[start:i+1] + "\n")
            print("Successfully extracted src/pages/Admin.tsx")
            break
