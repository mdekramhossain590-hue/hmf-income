with open("src/pages/Payment.tsx", "r") as f:
    code = f.read()

code = code.replace(
    "account: senderNumber,",
    "wallet: 'main',\n        account: senderNumber,"
)

with open("src/pages/Payment.tsx", "w") as f:
    f.write(code)
