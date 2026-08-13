import re
with open("src/pages/Admin.tsx", "r") as f:
    code = f.read()

code = code.replace('if (!window.confirm("Are you sure you want to fix Math & Spin exploits? This will remove extra earnings from users who bypassed the limit.")) return;', '')

with open("src/pages/Admin.tsx", "w") as f:
    f.write(code)
