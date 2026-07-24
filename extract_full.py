import re

with open("mem_dump.bin", "rb") as f:
    data = f.read()

text = data.decode('utf-8', errors='ignore')

# Find the start
start_pattern = "import React, { useState, useEffect"
start_idx = text.rfind(start_pattern)

if start_idx == -1:
    start_idx = text.rfind("export function AdminPanel()")

if start_idx != -1:
    # Let's find the closing tag. The file ends with standard HTML or `);` or `}`
    # We can just read 350,000 chars and let bracket matching do the rest
    chunk = text[start_idx : start_idx + 450000]
    
    # We can write a simple bracket matcher to find the exact end of AdminPanel
    open_braces = 0
    in_component = False
    
    # Alternatively, just save the whole chunk and grep for the end
    with open("Admin_raw.txt", "w") as out:
        out.write(chunk)
    print(f"Saved Admin_raw.txt starting at {start_idx}")
else:
    print("Start not found")
