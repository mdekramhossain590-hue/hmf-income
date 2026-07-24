import re

with open("mem_dump.bin", "rb") as f:
    data = f.read()

text = data.decode('utf-8', errors='ignore')

matches = [m.start() for m in re.finditer(r'handleFixBonusAmounts = async', text)]
print(f"Found {len(matches)} matches")

for i, start in enumerate(matches):
    chunk = text[max(0, start - 100000) : start + 100000]
    button_count = chunk.count('<button')
    print(f"Match {i} has {button_count} buttons")
    if button_count > 30:
        with open(f"Admin_recovered_{i}.txt", "w") as out:
            out.write(chunk)
        print(f"Saved Admin_recovered_{i}.txt")
