import string

with open("Admin_candidate_4.tsx", "rb") as f:
    data = f.read()

# Filter out non-printable chars except newlines and tabs
printable = set(string.printable.encode())
filtered = bytes([b for b in data if b in printable])
text = filtered.decode('utf-8')

start = text.find("import React")
if start == -1:
    start = text.find("export function")
    
end = text.find("  );\n}\n")
if end == -1:
    end = text.find("  );\n}")

if start != -1 and end != -1:
    with open("Admin_fixed.tsx", "w") as out:
        out.write(text[start:end+6])
    print(f"Success! {len(text[start:end+6])} chars")
else:
    print(f"Failed. Start: {start}, End: {end}")
