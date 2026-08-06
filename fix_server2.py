with open('server.ts', 'r') as f:
    code = f.read()

# Let's find the exact string to remove.
start = code.find('      const response = await fetch("https://api.zinipay.com/v1/payment/create"')
if start != -1:
    end = code.find('  app.post("/api/uddoktapay/create"', start)
    if end != -1:
        code = code[:start] + code[end:]

with open('server.ts', 'w') as f:
    f.write(code)
