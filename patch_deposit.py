import re

with open('src/pages/Deposit.tsx', 'r') as f:
    code = f.read()

code = code.replace('/api/zinipay/create', '/api/uddoktapay/create')
code = code.replace('ZiniPay', 'UddoktaPay')
code = code.replace('body: JSON.stringify({ amount: Number(amount), uid: profile?.id })', 'body: JSON.stringify({ amount: Number(amount), uid: profile?.id, name: profile?.name || "User", email: profile?.email || "user@example.com" })')

with open('src/pages/Deposit.tsx', 'w') as f:
    f.write(code)

print("Updated Deposit.tsx")
