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

fix_file('server.ts', [
    ('(doc)', '(doc: any)'),
    ('doc =>', '(doc: any) =>'),
    ('t =>', '(t: any) =>'),
    ('(t)', '(t: any)')
])

fix_file('src/components/NotificationListener.tsx', [
    ('import.meta.env', '(import.meta as any).env')
])

fix_file('src/main.tsx', [
    ('safeStringify = (obj: any)', 'safeStringify = (obj: any): string'),
    ('return undefined;', 'return undefined as any;'),
    ('return value;', 'return value;')
])

fix_file('src/pages/Dashboard.tsx', [
    ('auth.currentUser.uid', 'auth.currentUser?.uid'),
    ('(a as number)', '(a as any)'),
    ('(b as number)', '(b as any)'),
    ('Object.values(profile?.balances?.tasks || {}).reduce((a, b)', 'Object.values(profile?.balances?.tasks || {}).reduce((a: any, b: any)')
])

fix_file('src/pages/Drive.tsx', [
    ('const offerSnap = await getDoc(q);', 'const offerSnap = await getDocs(q);')
])

fix_file('src/pages/Profile.tsx', [
    ('setNewPhone(profile?.phone)', 'setNewPhone(profile?.phone || "")'),
    ('setNewWallet(profile?.walletAddress)', 'setNewWallet(profile?.walletAddress || "")'),
    ('(a: any, b: any) => Number(a) + Number(b)', '(a: any, b: any) => Number(a||0) + Number(b||0)')
])

fix_file('src/pages/Recharge.tsx', [
    ('profile?.balances?.tasks?.[selectedWallet]', '(profile?.balances?.tasks as any)?.[selectedWallet]'),
    ('userData.balances?.tasks?.[selectedWallet]', '(userData.balances?.tasks as any)?.[selectedWallet]')
])

fix_file('src/pages/Refer.tsx', [
    ('referral.level', '(referral as any).level')
])

fix_file('src/pages/Wallet.tsx', [
    ('profile?.balances?.tasks?.[selectedWallet]', '(profile?.balances?.tasks as any)?.[selectedWallet]'),
    ('profile?.balances?.tasks?.[taskName]', '(profile?.balances?.tasks as any)?.[taskName]'),
    ('userData.balances?.tasks?.[selectedWallet]', '(userData.balances?.tasks as any)?.[selectedWallet]')
])

print("done fixing TS errors")
