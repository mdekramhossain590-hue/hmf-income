import re

with open('src/pages/Dashboard.tsx', 'r') as f:
    code = f.read()

# Add alreadyClaimedPartner to the top
target_var = "const [claimingPartner, setClaimingPartner] = useState(false);"
repl_var = """const [claimingPartner, setClaimingPartner] = useState(false);

  const alreadyClaimedPartner = (() => {
    if (!profile?.partnerClaimedAt) return false;
    try {
      const lastClaimed = new Date(profile.partnerClaimedAt.toDate ? profile.partnerClaimedAt.toDate() : profile.partnerClaimedAt).toISOString().split('T')[0];
      const todayStr = new Date().toISOString().split('T')[0];
      return lastClaimed === todayStr;
    } catch (e) {
      return false;
    }
  })();"""

code = code.replace(target_var, repl_var)


# Replace button text
target_btn = """            disabled={claimingPartner}"""
repl_btn = """            disabled={claimingPartner || alreadyClaimedPartner}
            className={`w-full font-black uppercase tracking-[0.2em] py-3.5 rounded-2xl shadow-lg active:scale-95 transition-all text-xs ${alreadyClaimedPartner ? 'bg-slate-300 dark:bg-slate-700 text-slate-500 shadow-none cursor-not-allowed' : 'bg-indigo-600 text-white shadow-indigo-600/20'}`}"""

code = code.replace(target_btn, repl_btn)

# Remove old className
target_class = """            className="w-full bg-indigo-600 text-white font-black uppercase tracking-[0.2em] py-3.5 rounded-2xl shadow-lg shadow-indigo-600/20 active:scale-95 transition-all text-xs"
          >
            Claim Daily ৳{partnerSettings.dailyBonus}
          </button>"""
repl_class = """          >
            {alreadyClaimedPartner ? 'Claimed Today' : `Claim Daily ৳${partnerSettings.dailyBonus}`}
          </button>"""

code = code.replace(target_class, repl_class)


with open('src/pages/Dashboard.tsx', 'w') as f:
    f.write(code)

