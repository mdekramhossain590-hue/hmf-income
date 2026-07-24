import re

with open('src/pages/Admin.tsx', 'r') as f:
    code = f.read()

# Remove handleFixBonusAmounts
code = re.sub(r'  const handleFixBonusAmounts = async \(\) => \{.*?// Fix Old Referrals\s*', '', code, flags=re.DOTALL)
# Try more specifically to remove the function bodies
code = re.sub(r'  const handleFixBonusAmounts = async \(\) => \{.*?(?=  const handleFixOldReferrals)', '', code, flags=re.DOTALL)
code = re.sub(r'  const handleFixOldReferrals = async \(\) => \{.*?(?=  const handleSaveSiteSettings)', '', code, flags=re.DOTALL)

with open('src/pages/Admin.tsx', 'w') as f:
    f.write(code)
