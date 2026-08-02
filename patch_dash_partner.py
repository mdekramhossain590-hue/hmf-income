import re

with open('src/pages/Dashboard.tsx', 'r') as f:
    code = f.read()

# Replace actualReferralsCount with partnerReferralsCount for the Partner Program section
code = re.sub(r'const \[actualReferralsCount, setActualReferralsCount\] = useState\(profile\?\.totalReferrals \|\| 0\);', r'const [actualReferralsCount, setActualReferralsCount] = useState(profile?.totalReferrals || 0);\n  const partnerReferralsCount = profile?.partnerReferrals || 0;', code)

# In Partner section, use partnerReferralsCount
code = re.sub(r'\{actualReferralsCount\} / \{partnerSettings\.requiredReferrals\}', r'{partnerReferralsCount} / {partnerSettings.requiredReferrals}', code)

code = re.sub(r'Math\.min\(100, \(\(actualReferralsCount\) / partnerSettings\.requiredReferrals\) \* 100\)', r'Math.min(100, (partnerReferralsCount / partnerSettings.requiredReferrals) * 100)', code)

code = re.sub(r'if \(\(actualReferralsCount\) < partnerSettings\.requiredReferrals\) \{', r'if (partnerReferralsCount < partnerSettings.requiredReferrals) {', code)

with open('src/pages/Dashboard.tsx', 'w') as f:
    f.write(code)

