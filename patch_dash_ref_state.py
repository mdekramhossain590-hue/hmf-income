import re

with open('src/pages/Dashboard.tsx', 'r') as f:
    code = f.read()

code = code.replace('const [userTasks, setUserTasks] = useState<any[]>([]);', 'const [userTasks, setUserTasks] = useState<any[]>([]);\\n  const [userReferrals, setUserReferrals] = useState<any[]>([]);')

with open('src/pages/Dashboard.tsx', 'w') as f:
    f.write(code)

