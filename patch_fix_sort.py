with open("src/pages/Admin.tsx", "r") as f:
    code = f.read()

code = code.replace("spinTxs.sort((a, b) => (a.createdAt?.toMillis() || 0) - (b.createdAt?.toMillis() || 0));", "spinTxs.sort((a, b) => ((a.createdAt?.toMillis ? a.createdAt.toMillis() : 0)) - ((b.createdAt?.toMillis ? b.createdAt.toMillis() : 0)));")
code = code.replace("mathTxs.sort((a, b) => (a.createdAt?.toMillis() || 0) - (b.createdAt?.toMillis() || 0));", "mathTxs.sort((a, b) => ((a.createdAt?.toMillis ? a.createdAt.toMillis() : 0)) - ((b.createdAt?.toMillis ? b.createdAt.toMillis() : 0)));")

with open("src/pages/Admin.tsx", "w") as f:
    f.write(code)
