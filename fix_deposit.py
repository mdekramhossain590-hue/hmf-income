with open("src/pages/Deposit.tsx", "r") as f:
    code = f.read()

code = code.replace(
    "account: senderNumber,",
    "wallet: 'main',\n        account: senderNumber,"
)

with open("src/pages/Deposit.tsx", "w") as f:
    f.write(code)
