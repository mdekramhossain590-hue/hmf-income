import string

with open('Admin_candidate_4.tsx', 'rb') as f:
    data = f.read()

text = bytes([b for b in data if b in set(string.printable.encode())]).decode('utf-8')

# Find the start
start = text.rfind("import ", 0, text.find("export function AdminPanel"))
if start == -1:
    print("Failed to find start")
    exit(1)

# Find the end
end_str = "    </div>\n  );"
end = text.find(end_str, text.find("showNotifyModal &&"))

if end == -1:
    print("Failed to find end")
    exit(1)

with open('src/pages/Admin.tsx', 'w') as out:
    out.write(text[start:end + len(end_str)] + "\n}\n")
    
print("Successfully restored src/pages/Admin.tsx")
