import re
with open("src/pages/Admin.tsx", "r") as f:
    code = f.read()

replacement = """  const fixExploit = async () => {
    toast.info("Fixing exploit in progress... Please wait.");
    console.log("Starting fixExploit");
    try {"""

code = re.sub(r'  const fixExploit = async \(\) => \{\s*try \{', replacement, code)

with open("src/pages/Admin.tsx", "w") as f:
    f.write(code)
