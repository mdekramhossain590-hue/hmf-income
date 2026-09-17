import re

with open('src/pages/Admin.tsx', 'r') as f:
    code = f.read()

# Replace tasks rendering in the user list
old_tasks = "Tasks: ৳{u.balances?.tasks || 0}"
new_tasks = "Tasks: ৳{typeof u.balances?.tasks === 'object' ? Object.values(u.balances?.tasks || {}).reduce((a: any, b: any) => Number(a||0) + Number(b||0), 0) : (u.balances?.tasks || 0)}"

code = code.replace(old_tasks, new_tasks)

# Replace tasks editing
old_edit = '"balances.tasks": Number(editingUser.balances?.tasks || 0)'
new_edit = '"balances.tasks": typeof editingUser.balances?.tasks === \'object\' ? editingUser.balances.tasks : Number(editingUser.balances?.tasks || 0)'

code = code.replace(old_edit, new_edit)

# Fix total calculation inside leaderboard update
old_total = 'totalIncome: Number(editingUser.balances?.main || 0) + Number(editingUser.balances?.bonus || 0) + Number(editingUser.balances?.referral || 0) + Number(editingUser.balances?.partner || 0) + Number(editingUser.balances?.tasks || 0)'
new_total = 'totalIncome: Number(editingUser.balances?.main || 0) + Number(editingUser.balances?.bonus || 0) + Number(editingUser.balances?.referral || 0) + Number(editingUser.balances?.partner || 0) + (typeof editingUser.balances?.tasks === \'object\' ? Object.values(editingUser.balances?.tasks || {}).reduce((a: any, b: any) => Number(a||0) + Number(b||0), 0) as number : Number(editingUser.balances?.tasks || 0))'

code = code.replace(old_total, new_total)

# Fix input value in edit modal
old_input = "value={editingUser.balances?.[type] ?? ''}"
new_input = "value={type === 'tasks' && typeof editingUser.balances?.tasks === 'object' ? Object.values(editingUser.balances?.tasks || {}).reduce((a: any, b: any) => Number(a||0) + Number(b||0), 0) : (editingUser.balances?.[type] ?? '')}"
code = code.replace(old_input, new_input)

# Wait, if we edit tasks when it is an object, does it overwrite?
# Yes, the onChange is: onChange={(e) => setEditingUser({...editingUser, balances: {...(editingUser.balances || {}), [type]: parseFloat(e.target.value) || 0}})}
# This would turn tasks back to a number. 
# But wait, we shouldn't allow editing `tasks` if it's an object in this simple input. Or if we do, it overwrites it. 
# Better: just disable editing `tasks` if it's an object, or let it just edit the `total` and reset the object? No, better not to edit the object via a single input.
# Let's just fix the render first.

with open('src/pages/Admin.tsx', 'w') as f:
    f.write(code)
print("done")
