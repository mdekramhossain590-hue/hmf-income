with open("src/pages/Payment.tsx", "r") as f:
    code = f.read()
code = code.replace("amount: settings.fee,", "amount: Number(settings.fee),")
with open("src/pages/Payment.tsx", "w") as f:
    f.write(code)
