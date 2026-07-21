import re

def fix_file(filepath):
    with open(filepath, 'r') as f:
        code = f.read()

    # Replace referredEmail || referredName with referredName || referredEmail
    code = code.replace(
        '(activity.referredEmail || activity.referredName || "User")',
        '(activity.referredName || activity.referredEmail?.split("@")[0] || "User")'
    )
    
    with open(filepath, 'w') as f:
        f.write(code)

fix_file('src/pages/Dashboard.tsx')
fix_file('src/pages/ActivityHistory.tsx')
