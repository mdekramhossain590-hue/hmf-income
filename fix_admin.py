import re

with open('src/pages/Admin.tsx', 'r') as f:
    code = f.read()

# Fix the stray '}; fullName: ...'
code = code.replace("}; fullName: string; main: number; bonus: number; referral: number; partner: number; tasks: number } | null>(null);", "};")
code = code.replace("  const [editingUserBalance, setEditingUserBalance] = useState  const [editingJobId", "  const [editingUserBalance, setEditingUserBalance] = useState<{ id: string; fullName: string; main: number; bonus: number; referral: number; partner: number; tasks: number } | null>(null);\n  const [editingJobId")

with open('src/pages/Admin.tsx', 'w') as f:
    f.write(code)
print("fixed")
