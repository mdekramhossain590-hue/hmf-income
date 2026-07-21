import re
with open('src/pages/Refer.tsx', 'r') as f:
    code = f.read()

if "ref.referredName?.charAt(0) || ref.referredEmail?.charAt(0) || '?'" in code:
    code = code.replace(
        "ref.referredName?.charAt(0) || ref.referredEmail?.charAt(0) || '?'",
        "ref.referredName?.charAt(0) || ref.referredEmail?.charAt(0) || 'U'"
    )
    code = code.replace(
        "ref.referredName || 'User'",
        "ref.referredName || ref.referredEmail?.split('@')[0] || 'User'"
    )
    with open('src/pages/Refer.tsx', 'w') as f:
        f.write(code)
