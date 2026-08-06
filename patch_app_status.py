import re

with open('src/App.tsx', 'r') as f:
    code = f.read()

if "import { PaymentStatus } from './pages/PaymentStatus';" not in code:
    code = code.replace("import { Deposit } from './pages/Deposit';", "import { Deposit } from './pages/Deposit';\nimport { PaymentStatus } from './pages/PaymentStatus';")

if '<Route path="/payment/success" element={<PaymentStatus status="success" />} />' not in code:
    code = code.replace('<Route path="/deposit" element={<Deposit />} />', '<Route path="/deposit" element={<Deposit />} />\n                <Route path="/payment/success" element={<PaymentStatus status="success" />} />\n                <Route path="/payment/cancel" element={<PaymentStatus status="cancel" />} />')

with open('src/App.tsx', 'w') as f:
    f.write(code)

print("Added PaymentStatus routes to App.tsx")
