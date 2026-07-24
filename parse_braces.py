with open("Admin_raw.txt", "r") as f:
    text = f.read()

# Let's find "export function AdminPanel"
start = text.find("export function AdminPanel")
if start == -1:
    print("Not found")
    exit(1)

# Now iterate and count braces { }
brace_count = 0
in_component = False

for i in range(start, len(text)):
    if text[i] == '{':
        brace_count += 1
        in_component = True
    elif text[i] == '}':
        brace_count -= 1
        if in_component and brace_count == 0:
            print(f"Component ends at {i}")
            # Try to grab imports before `start`
            imports_start = text.rfind("import ", 0, start)
            
            with open("Admin_recovered.tsx", "w") as out:
                out.write(text[imports_start:i+1])
            print("Successfully extracted Admin_recovered.tsx")
            break
