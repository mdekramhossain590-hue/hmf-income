import re

with open('src/pages/Admin.tsx', 'r') as f:
    code = f.read()

func_code = """
  const saveUserBalance = async () => {
    if (!editingUserBalance) return;
    try {
      const { db } = await import('../lib/firebase');
      const { updateDoc, doc, setDoc } = await import('firebase/firestore');
      await updateDoc(doc(db, "users", editingUserBalance.id), {
        "balances.main": editingUserBalance.main,
        "balances.bonus": editingUserBalance.bonus,
        "balances.referral": editingUserBalance.referral,
        "balances.partner": editingUserBalance.partner,
        "balances.tasks": editingUserBalance.tasks,
      });
      await setDoc(doc(db, "leaderboard", editingUserBalance.id), {
        totalIncome: editingUserBalance.main + editingUserBalance.bonus + editingUserBalance.referral + editingUserBalance.partner + editingUserBalance.tasks
      }, { merge: true });
      toast.success("Balances updated!");
      setEditingUserBalance(null);
      loadData(true);
    } catch(err: any) {
      toast.error(err.message);
    }
  };
"""

if "const saveUserBalance" not in code:
    code = code.replace(
        "const handleChangePassword =",
        func_code + "\n  const handleChangePassword ="
    )

with open('src/pages/Admin.tsx', 'w') as f:
    f.write(code)
print("Admin balance fix done")
