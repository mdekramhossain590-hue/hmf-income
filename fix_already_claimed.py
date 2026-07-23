import re

with open('src/pages/Dashboard.tsx', 'r') as f:
    code = f.read()

target = """  const [claimingPartner, setClaimingPartner] = useState(false);

  const alreadyClaimedPartner = (() => {
    if (!profile?.partnerClaimedAt) return false;
    try {
      const lastClaimed = new Date(profile.partnerClaimedAt.toDate ? profile.partnerClaimedAt.toDate() : profile.partnerClaimedAt).toISOString().split('T')[0];
      const todayStr = new Date().toISOString().split('T')[0];
      return lastClaimed === todayStr;
    } catch (e) {
      return false;
    }
  })();

  const {
    profile,
    user,
    loading,
    logOut,
    refreshProfile,
    siteSettings,
    isQuotaExceeded,
  } = useAuth();"""

import re
# find the block with alreadyClaimedPartner
block = re.search(r'  const alreadyClaimedPartner = \(\(\) => \{.*?  \}\)\(\);\n', code, re.DOTALL)
if block:
    print("Found block")
    code = code.replace(block.group(0), "")
    
    # insert it after useAuth()
    use_auth_block = re.search(r'  const \{\n    profile,\n    user,\n    loading,\n    logOut,\n    refreshProfile,\n    siteSettings,\n    isQuotaExceeded,\n  \} = useAuth\(\);\n', code, re.DOTALL)
    
    if use_auth_block:
        print("Found useAuth block")
        code = code.replace(use_auth_block.group(0), use_auth_block.group(0) + "\n" + block.group(0))
        with open('src/pages/Dashboard.tsx', 'w') as f:
            f.write(code)
            print("Successfully patched")
else:
    print("Block not found")
