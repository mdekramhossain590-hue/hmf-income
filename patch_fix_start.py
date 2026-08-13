with open("src/pages/Admin.tsx", "r") as f:
    code = f.read()

replacement = """  const fixExploit = async () => {
    toast.success("Fixing exploit in progress... Please wait.");
    console.log("Starting fixExploit");
    try {"""

code = code.replace("  const fixExploit = async () => {\\n    \\n    try {", replacement)

with open("src/pages/Admin.tsx", "w") as f:
    f.write(code)
