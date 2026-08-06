import re

with open('src/App.tsx', 'r') as f:
    code = f.read()

if "import { Deposit } from './pages/Deposit';" not in code:
    code = code.replace("import { Recharge } from './pages/Recharge';", "import { Recharge } from './pages/Recharge';\nimport { Deposit } from './pages/Deposit';")

if '<Route path="/deposit" element={<Deposit />} />' not in code:
    code = code.replace('<Route path="/recharge" element={<Recharge />} />', '<Route path="/recharge" element={<Recharge />} />\n                <Route path="/deposit" element={<Deposit />} />')

with open('src/App.tsx', 'w') as f:
    f.write(code)

print("Added Deposit to App.tsx")
