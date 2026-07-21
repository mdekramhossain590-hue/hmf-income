import re

def fix_file(filepath):
    with open(filepath, 'r') as f:
        code = f.read()

    # Find getRefBonus
    target_pattern = r"  const getRefBonus = \(ref: any\) => \{[\s\S]*?\n  \};"
    
    replacement = """  const getRefBonus = (ref: any) => {
    let raw = ref.bonusEarned !== undefined ? Number(ref.bonusEarned) : 0;
    if (raw > 0) {
       return raw;
    }
    if (ref.level === 3) return 0;
    if (ref.level === 2) return 3;
    return 5;
  };"""

    code = re.sub(target_pattern, replacement, code)
    with open(filepath, 'w') as f:
        f.write(code)

fix_file('src/pages/Refer.tsx')
fix_file('src/pages/Dashboard.tsx')
fix_file('src/pages/ActivityHistory.tsx')

