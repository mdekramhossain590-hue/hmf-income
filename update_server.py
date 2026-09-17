import os

filepath = "server.ts"
with open(filepath, "r") as f:
    content = f.read()

# I want to replace the `t.set(userRef, { balances: { ads_income_wallet: admin.firestore.FieldValue.increment(rewardAmount) } }, { merge: true })`
# with: 
# t.update(userRef, {
#   "balances.tasks.Watch Ads": admin.firestore.FieldValue.increment(rewardAmount)
# });

import re
old_block = """        // Update user wallet (ads_income_wallet)
        const userRef = db.collection("users").doc(uid);
        t.set(userRef, {
          balances: {
            ads_income_wallet: admin.firestore.FieldValue.increment(rewardAmount)
          }
        }, { merge: true });"""

new_block = """        // Update user wallet (Watch Ads)
        const userRef = db.collection("users").doc(uid);
        t.update(userRef, {
          "balances.tasks.Watch Ads": admin.firestore.FieldValue.increment(rewardAmount)
        });"""

content = content.replace(old_block, new_block)

with open(filepath, "w") as f:
    f.write(content)
print("Updated server.ts")
