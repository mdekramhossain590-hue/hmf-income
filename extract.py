import re

with open("mem_dump.bin", "rb") as f:
    data = f.read()

# Try to find a chunk containing the Admin component
# We'll look for strings starting with something typical, maybe "export default function Admin"
# and ending with the end of the file.

text = data.decode('utf-8', errors='ignore')

matches = [m.start() for m in re.finditer(r'export default function Admin', text)]
print(f"Found {len(matches)} matches")

for i, start in enumerate(matches):
    # try to grab a large chunk of text around it
    chunk = text[max(0, start - 1000) : start + 150000]
    
    # Let's count how many buttons it has. The original had 71.
    button_count = chunk.count('<button')
    print(f"Match {i} has {button_count} buttons")
    if button_count > 50:
        with open(f"Admin_recovered_{i}.tsx", "w") as out:
            out.write(chunk)
        print(f"Saved Admin_recovered_{i}.tsx")

