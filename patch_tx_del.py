import re
with open("src/pages/Admin.tsx", "r") as f:
    code = f.read()

# I want to delete the extra transactions properly
code = code.replace("// Optionally delete the transaction: await deleteDoc(doc(db, `users/${userDoc.id}/transactions`, tx.id));", "const { deleteDoc } = await import('firebase/firestore'); await deleteDoc(doc(db, `users/${userDoc.id}/transactions`, tx.id));")

with open("src/pages/Admin.tsx", "w") as f:
    f.write(code)
