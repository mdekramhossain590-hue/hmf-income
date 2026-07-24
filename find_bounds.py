import re

for i in [2, 3, 4, 8]:
    with open(f"Admin_recovered_{i}.txt", "r") as f:
        text = f.read()
    
    # Try to find imports at the start
    start_idx = text.rfind("import React", 0, 100000)
    if start_idx == -1:
        start_idx = text.rfind("import ", 0, 100000)
    
    # Try to find the end
    end_idx = text.find("\n}\n", 100000)
    if end_idx == -1:
        end_idx = text.find("\n};\n", 100000)
        
    print(f"File {i}: start {start_idx}, end {end_idx}")
    if start_idx != -1 and end_idx != -1:
        print(text[start_idx:start_idx+100])
        print("...")
        print(text[end_idx-100:end_idx+5])
        print("-" * 50)
