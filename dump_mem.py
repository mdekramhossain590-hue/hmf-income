import sys, re

pid = "39"
maps_file = f"/proc/{pid}/maps"
mem_file = f"/proc/{pid}/mem"

try:
    with open(maps_file, 'r') as f:
        maps = f.readlines()
except:
    sys.exit(1)

out_file = "mem_dump.bin"
with open(out_file, 'wb') as out, open(mem_file, 'rb') as mem:
    for line in maps:
        if "rw-p" not in line:
            continue
        parts = line.split()
        start, end = parts[0].split('-')
        start = int(start, 16)
        end = int(end, 16)
        size = end - start
        if size > 100*1024*1024:
            continue # skip huge regions to save time
        try:
            mem.seek(start)
            chunk = mem.read(size)
            out.write(chunk)
        except:
            pass
print("Dumped")
