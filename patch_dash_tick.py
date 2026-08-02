import re

with open('src/pages/Dashboard.tsx', 'r') as f:
    code = f.read()

# Add CheckCircle2 import if needed
if 'CheckCircle2' not in code:
    code = code.replace("import { CheckCircle,", "import { CheckCircle, CheckCircle2,")
    
# Find the H3 for fullName
target = r'<h3 className="font-display font-medium text-xl leading-none text-gray-800 dark:text-white mt-1 tracking-tight">\s*\{profile\?\.fullName \|\| user\?\.displayName \|\| "User"\}\s*</h3>'

replacement = """<h3 className="font-display font-medium text-xl leading-none text-gray-800 dark:text-white mt-1 tracking-tight flex items-center gap-1.5">
                {profile?.fullName || user?.displayName || "User"}
                {partnerSettings?.enabled && partnerReferralsCount >= (partnerSettings?.requiredReferrals || 10) && (
                  <CheckCircle2 className="w-5 h-5 text-blue-500 fill-blue-500/20" />
                )}
              </h3>"""

code = re.sub(target, replacement, code)

with open('src/pages/Dashboard.tsx', 'w') as f:
    f.write(code)

