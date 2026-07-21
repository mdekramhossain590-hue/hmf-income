import re

with open('src/pages/ActivityHistory.tsx', 'r') as f:
    code = f.read()

get_ref_bonus_def = """  const getRefBonus = (ref: any) => {
    let raw = ref.bonusEarned !== undefined ? Number(ref.bonusEarned) : 0;
    if (raw > 0) {
       if (ref.level === 1 && raw >= 10) return 5;
       if (ref.level === 2 && raw >= 5) return 3;
       if (ref.level === 3 && raw > 0) return 0;
       return raw;
    }
    if (ref.level === 3) return 0;
    if (ref.level === 2) return 3;
    return 5;
  };
"""

code = code.replace("  useEffect(() => {", get_ref_bonus_def + "\\n  useEffect(() => {")

target_amount = """            const displayAmount = parseFloat(activity.reward || activity.amount || activity.bonusEarned || 0).toFixed(2);"""

repl_amount = """            let displayAmount = parseFloat(activity.reward || activity.amount || activity.bonusEarned || 0).toFixed(2);
            if (isReferral) {
                displayAmount = getRefBonus(activity).toFixed(2);
            }"""

code = code.replace(target_amount, repl_amount)

target_ref = """            if (isReferral) {
                title = (language === "Bengali" ? "রেফারেল: " : "Referral: ") + (activity.referredName || "User");"""

repl_ref = """            if (isReferral) {
                title = (language === "Bengali" ? "রেফারেল: " : "Referral: ") + (activity.referredEmail || activity.referredName || "User");"""

code = code.replace(target_ref, repl_ref)

with open('src/pages/ActivityHistory.tsx', 'w') as f:
    f.write(code)

