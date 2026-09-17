import re

files = ['src/pages/Dashboard.tsx', 'src/pages/Profile.tsx']

for file in files:
    with open(file, 'r') as f:
        code = f.read()

    # Find the bad tasks sum
    old = "Object.values(profile?.balances?.tasks || {}).reduce((a, b) => (a as number) + (b as number), 0)"
    new = "(typeof profile?.balances?.tasks === 'object' ? Object.values(profile.balances.tasks).reduce((a: any, b: any) => Number(a) + Number(b), 0) : Number(profile?.balances?.tasks || 0))"

    code = code.replace(old, new)

    with open(file, 'w') as f:
        f.write(code)

print("fixed balances")
