import re

with open('src/pages/Admin.tsx', 'r') as f:
    code = f.read()

# Replace the buttons
code = re.sub(r'<button[^>]*onClick=\{\(e\) => \{ e\.preventDefault\(\); e\.stopPropagation\(\); handleFixOldReferrals\(\); \}\}[^>]*>.*?</button>', '', code, flags=re.DOTALL)
code = re.sub(r'<button[^>]*onClick=\{\(e\) => \{ e\.preventDefault\(\); e\.stopPropagation\(\); handleFixBonusAmounts\(\); \}\}[^>]*>.*?</button>', '', code, flags=re.DOTALL)

with open('src/pages/Admin.tsx', 'w') as f:
    f.write(code)
print("Removed buttons")
