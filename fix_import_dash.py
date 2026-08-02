import re

with open('src/pages/Dashboard.tsx', 'r') as f:
    code = f.read()

if 'CheckCircle2' not in code[:1000]:
    # find where lucide-react is imported
    match = re.search(r'import \{([^}]+)\} from ["\']lucide-react["\'];?', code)
    if match:
        imports = match.group(1)
        if 'CheckCircle2' not in imports:
            new_imports = imports + ', CheckCircle2'
            code = code.replace(match.group(0), f'import {{{new_imports}}} from "lucide-react";')

with open('src/pages/Dashboard.tsx', 'w') as f:
    f.write(code)
