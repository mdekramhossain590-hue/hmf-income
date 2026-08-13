with open("src/pages/Admin.tsx", "r") as f:
    code = f.read()

import re

# Remove tasks balance input
code = re.sub(r'<div>\s*<label[^>]*>Tasks Balance</label>\s*<input[^>]*value=\{editingUserBalance\.tasks\}[^>]*>\s*</div>', '', code)

# Remove balances.tasks update
code = code.replace('"balances.tasks": editingUserBalance.tasks,', '')

# Remove tasks from leaderboard total Income
code = code.replace('+ editingUserBalance.tasks', '')

with open("src/pages/Admin.tsx", "w") as f:
    f.write(code)
