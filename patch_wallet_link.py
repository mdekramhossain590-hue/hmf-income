import re

with open('src/pages/Wallet.tsx', 'r') as f:
    code = f.read()

# Replace window.location.href = data.url; with window.open(data.url, '_blank') or fallback
code = code.replace(
    'window.location.href = data.url;',
    'window.open(data.url, "_blank") || (window.location.href = data.url);'
)

with open('src/pages/Wallet.tsx', 'w') as f:
    f.write(code)

print("Updated Wallet.tsx link handling")
