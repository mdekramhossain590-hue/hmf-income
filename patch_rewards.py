import re

with open('src/pages/Admin.tsx', 'r') as f:
    admin_code = f.read()

# Default referral settings
admin_code = admin_code.replace(
    'const [referralSettings, setReferralSettings] = useState({ fixedBonus: 10, gen2FixedBonus: 0, gen3FixedBonus: 0,',
    'const [referralSettings, setReferralSettings] = useState({ fixedBonus: 5, gen2FixedBonus: 3, gen3FixedBonus: 1,'
)

# Default job reward
admin_code = re.sub(r'reward: 10,', 'reward: 3,', admin_code)

# Fix bonus logic
old_logic = """            if (data.level === 1 && data.bonusEarned === 20) {
              diff = 10; newBonus = 10;
            } else if (data.level === 2 && data.bonusEarned === 10) {
              diff = 5; newBonus = 5;
            } else if (data.level === 3 && data.bonusEarned === 5) {
              diff = 2; newBonus = 3;
            }"""
new_logic = """            if (data.level === 1 && data.bonusEarned > 5) {
              diff = data.bonusEarned - 5; newBonus = 5;
            } else if (data.level === 2 && data.bonusEarned > 3) {
              diff = data.bonusEarned - 3; newBonus = 3;
            } else if (data.level === 3 && data.bonusEarned > 1) {
              diff = data.bonusEarned - 1; newBonus = 1;
            }"""
admin_code = admin_code.replace(old_logic, new_logic)

with open('src/pages/Admin.tsx', 'w') as f:
    f.write(admin_code)

with open('src/pages/PostJob.tsx', 'r') as f:
    postjob_code = f.read()

postjob_code = postjob_code.replace('const [reward, setReward] = useState(2); // Minimum 2 Taka', 'const [reward, setReward] = useState(3); // Minimum 3 Taka')
postjob_code = postjob_code.replace("toast.error('Minimum reward per task is ৳1.00');", "toast.error('Minimum reward per task is ৳3.00');")
postjob_code = postjob_code.replace("if (reward < 1) {", "if (reward < 3) {")
postjob_code = postjob_code.replace('Math.max(1, parseFloat', 'Math.max(3, parseFloat')
postjob_code = postjob_code.replace('min="1"', 'min="3"')

with open('src/pages/PostJob.tsx', 'w') as f:
    f.write(postjob_code)

with open('src/lib/referral.ts', 'r') as f:
    ref_code = f.read()

ref_code = ref_code.replace('let gen1 = 10, gen2 = 0, gen3 = 0;', 'let gen1 = 5, gen2 = 3, gen3 = 1;')

with open('src/lib/referral.ts', 'w') as f:
    f.write(ref_code)

