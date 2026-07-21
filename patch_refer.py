import re

with open('src/pages/Refer.tsx', 'r') as f:
    code = f.read()

target = """  const getRefBonus = (ref: any) => {
    let raw = ref.bonusEarned !== undefined ? Number(ref.bonusEarned) : 0;
    if (raw > 0) {
       // Cap historical bugs where old referrals got 20/10/5 instead of 10/5/3
       if (ref.level === 1 && raw === 20) return 10;
       if (ref.level === 2 && raw === 10) return 5;
       if (ref.level === 3 && raw === 5) return 3;
       return raw;
    }
    if (ref.level === 3) return 3;
    if (ref.level === 2) return 5;
    return 10;
  };"""

replacement = """  const getRefBonus = (ref: any) => {
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
  };"""

code = code.replace(target, replacement)

with open('src/pages/Refer.tsx', 'w') as f:
    f.write(code)

