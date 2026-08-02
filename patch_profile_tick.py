import re

with open('src/pages/Profile.tsx', 'r') as f:
    code = f.read()

# Add getCachedDoc to imports if not there
if 'getCachedDoc' not in code:
    code = code.replace('import { db', 'import { getCachedDoc } from "../lib/cache";\nimport { db')

# Add state for requiredReferrals
state_decl = """  const [requiredReferrals, setRequiredReferrals] = useState(10);
  useEffect(() => {
    getCachedDoc(doc(db, "settings", "dashboard")).then(snap => {
      if (snap.exists() && snap.data().partnerSettings) {
        setRequiredReferrals(snap.data().partnerSettings.requiredReferrals || 10);
      }
    });
  }, []);
"""

# Find place to inject state
code = code.replace("const handleEditName = () => {", state_decl + "\n  const handleEditName = () => {")

# Replace unconditional tick with conditional
unconditional_tick = """<div className="bg-blue-500 rounded-full p-0.5 text-white" title="Verified Account">
                    <Check className="w-3.5 h-3.5" />
                  </div>"""

conditional_tick = """{((profile?.partnerReferrals || 0) >= requiredReferrals) && (
                  <div className="bg-blue-500 rounded-full p-0.5 text-white shadow-sm" title="Verified Partner">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  )}"""

code = code.replace(unconditional_tick, conditional_tick)

with open('src/pages/Profile.tsx', 'w') as f:
    f.write(code)

