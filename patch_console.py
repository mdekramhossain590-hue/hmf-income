import os
import re

for root, _, files in os.walk('src'):
    for file in files:
        if not file.endswith('.tsx') and not file.endswith('.ts'):
            continue
        path = os.path.join(root, file)
        with open(path, 'r') as f:
            code = f.read()
        
        code = re.sub(r'console\.error\(\s*(e|err|error)\s*\)', r'console.error(\1?.message || \1)', code)
        code = re.sub(r'console\.error\(\s*([^,]+)\s*,\s*(e|err|error)\s*\)', r'console.error(\1, \2?.message || \2)', code)
        code = re.sub(r'\.catch\(console\.error\)', r'.catch(e => console.error(e?.message || e))', code)

        with open(path, 'w') as f:
            f.write(code)

print("patched console.error")
