import re

filepath = 'src/App.tsx'
with open(filepath, 'r') as f:
    text = f.read()

import_statement = "import { ActivityHistory } from './pages/ActivityHistory';"
if import_statement not in text:
    text = text.replace("import { Dashboard } from './pages/Dashboard';", f"import {{ Dashboard }} from './pages/Dashboard';\n{import_statement}")

route_statement = '<Route path="/activity" element={<ActiveGuard><ActivityHistory /></ActiveGuard>} />'
if route_statement not in text:
    text = text.replace('<Route path="/" element={<Dashboard />} />', f'<Route path="/" element={{<Dashboard />}} />\n            {route_statement}')

with open(filepath, 'w') as f:
    f.write(text)
    print("Patched App.tsx!")
