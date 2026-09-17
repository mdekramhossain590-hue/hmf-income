import re

with open('src/pages/Dashboard.tsx', 'r') as f:
    code = f.read()

code = code.replace("Object.values(profile.balances.tasks).reduce((a: any, b: any) => Number(a) + Number(b), 0) :", "Object.values(profile.balances.tasks).reduce((a: any, b: any) => Number(a) + Number(b), 0) as number :")
with open('src/pages/Dashboard.tsx', 'w') as f:
    f.write(code)

with open('src/pages/Profile.tsx', 'r') as f:
    code = f.read()

code = code.replace("Object.values(profile.balances.tasks).reduce((a: any, b: any) => Number(a||0) + Number(b||0), 0) :", "Object.values(profile.balances.tasks).reduce((a: any, b: any) => Number(a||0) + Number(b||0), 0) as number :")
with open('src/pages/Profile.tsx', 'w') as f:
    f.write(code)
print("done")
