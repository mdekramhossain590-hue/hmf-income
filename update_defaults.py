import re

with open('src/pages/Admin.tsx', 'r') as f:
    code = f.read()

code = code.replace(
    'const [referralSettings, setReferralSettings] = useState({ fixedBonus: 10, gen2FixedBonus: 0, gen3FixedBonus: 0',
    'const [referralSettings, setReferralSettings] = useState({ fixedBonus: 5, gen2FixedBonus: 3, gen3FixedBonus: 0'
)
code = code.replace(
    'reward: 10,',
    'reward: 5,'
)
code = code.replace(
    "reward: 10, link: '', type: 'Facebook', icon: 'MessageCircle'",
    "reward: 5, link: '', type: 'Facebook', icon: 'MessageCircle'"
)

with open('src/pages/Admin.tsx', 'w') as f:
    f.write(code)

with open('src/pages/PostJob.tsx', 'r') as f:
    post_job = f.read()

post_job = post_job.replace('const [reward, setReward] = useState(2); // Minimum 2 Taka per job', 'const [reward, setReward] = useState(3); // Minimum 3 Taka per job')

with open('src/pages/PostJob.tsx', 'w') as f:
    f.write(post_job)

