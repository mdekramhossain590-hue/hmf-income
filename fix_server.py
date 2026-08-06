import re

with open('server.ts', 'r') as f:
    code = f.read()

# I need to clean up the floating ZiniPay code.
start_idx = code.find('            const db = admin.firestore();\n            \n            // Store pending deposit\n      const docRef = await db.collection("payment_requests").add({')

if start_idx != -1:
    end_idx = code.find('  app.post("/api/uddoktapay/create"', start_idx)
    if end_idx != -1:
        code = code[:start_idx] + code[end_idx:]

with open('server.ts', 'w') as f:
    f.write(code)

print("Fixed server.ts")
