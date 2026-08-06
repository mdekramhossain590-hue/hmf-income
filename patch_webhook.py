import re

with open('server.ts', 'r') as f:
    code = f.read()

old = """
          // Update main balance
          const profileRef = db.collection("users").doc(metadata.uid);
          t.update(profileRef, {
            "balances.main": admin.firestore.FieldValue.increment(Number(amount))
          });
"""
new = """
          const profileRef = db.collection("users").doc(metadata.uid);
          if (data.type === 'activation') {
             t.update(profileRef, {
               "balances.bonus": admin.firestore.FieldValue.increment(10),
               isActive: true
             });
             const leaderboardRef = db.collection("leaderboard").doc(metadata.uid);
             t.set(leaderboardRef, { bonus: admin.firestore.FieldValue.increment(10), totalIncome: admin.firestore.FieldValue.increment(10) }, { merge: true });
          } else {
             t.update(profileRef, {
               "balances.main": admin.firestore.FieldValue.increment(Number(amount))
             });
          }
"""

code = code.replace(old.strip(), new.strip())

with open('server.ts', 'w') as f:
    f.write(code)

print("patched webhook")
