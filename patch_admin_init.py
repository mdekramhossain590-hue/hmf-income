with open("src/pages/Admin.tsx", "r") as f:
    code = f.read()

init_code = """
        const partnerDoc = await getDoc(doc(db, 'settings', 'partner'));
        if (!partnerDoc.exists()) {
          await setDoc(doc(db, 'settings', 'partner'), { withdrawEnabled: false });
        }
"""
code = code.replace("const actSnap = await getDoc(doc(db, 'settings', 'activation'));", init_code + "\n        const actSnap = await getDoc(doc(db, 'settings', 'activation'));")

with open("src/pages/Admin.tsx", "w") as f:
    f.write(code)
