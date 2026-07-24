import re

with open("mem_dump.bin", "rb") as f:
    data = f.read()

text = data.decode('utf-8', errors='ignore')

# Search for the Vite HMR injection or simply export function AdminPanel
# We will search for all occurrences of "export function AdminPanel"
starts = [m.start() for m in re.finditer(r'export function AdminPanel', text)]
print(f"Found {len(starts)} starts")

for i, s in enumerate(starts):
    # Find the preceding imports
    import_start = text.rfind("import ", max(0, s - 10000), s)
    if import_start == -1:
        import_start = s
    
    # Extract 200KB to 300KB, it should be enough (file is ~3700 lines which is ~150KB)
    chunk = text[import_start : import_start + 250000]
    
    # count buttons
    btn_count = chunk.count('<button')
    print(f"Chunk {i} has {btn_count} buttons")
    
    if btn_count > 60:
        with open(f"Admin_candidate_{i}.tsx", "w") as out:
            out.write(chunk)
        print(f"Saved Admin_candidate_{i}.tsx")
