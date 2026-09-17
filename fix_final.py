import re
import os

def fix_file(filepath, replacements):
    if not os.path.exists(filepath):
        return
    with open(filepath, 'r') as f:
        code = f.read()
    for old, new in replacements:
        code = code.replace(old, new)
    with open(filepath, 'w') as f:
        f.write(code)

fix_file('src/pages/Dashboard.tsx', [
    ('auth.currentUser?.uid', '(auth.currentUser?.uid as string)'),
])

fix_file('src/pages/Drive.tsx', [
    ('getDoc(q)', 'getDocs(q)')
])

fix_file('src/pages/Profile.tsx', [
    ('updatePassword(auth.currentUser, currentPassword)', 'updatePassword(auth.currentUser as any, currentPassword as string)'),
    ('updatePassword(auth.currentUser, newPassword)', 'updatePassword(auth.currentUser as any, newPassword as string)'),
    ('reauthenticateWithCredential(auth.currentUser, credential)', 'reauthenticateWithCredential(auth.currentUser as any, credential)'),
    ('EmailAuthProvider.credential(auth.currentUser.email, currentPassword)', 'EmailAuthProvider.credential((auth.currentUser?.email as string), (currentPassword as string))')
])

fix_file('src/pages/Refer.tsx', [
    ('referral.level', '(referral as any).level')
])

fix_file('src/main.tsx', [
    ('return JSON.stringify(obj, (key, value) => {', 'return JSON.stringify(obj, ((key: string, value: any) => {'),
    ('}      return value;', '}      return value;\n    }) as any);')
])

print("done")
