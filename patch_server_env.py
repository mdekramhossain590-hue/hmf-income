import re

with open('server.ts', 'r') as f:
    code = f.read()

code = code.replace(
    'let apiBaseUrl = process.env.UDDOKTAPAY_BASE_URL;',
    'let apiBaseUrl = process.env.UDDOKTAPAY_BASE_URL || process.env.UDDOKTAPAY_BASE_URI;'
)

with open('server.ts', 'w') as f:
    f.write(code)

print("Updated server.ts to support UDDOKTAPAY_BASE_URI")
