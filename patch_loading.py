import re
with open("src/pages/Admin.tsx", "r") as f:
    code = f.read()

replacement = """
  const fixExploit = async () => {
    toast.info("Processing... Please wait. Do not close this page.");
    try {
      const { db } = await import('../lib/firebase');
"""

code = code.replace("  const fixExploit = async () => {\\n    \\n    try {\\n      const { db } = await import('../lib/firebase');", replacement)

with open("src/pages/Admin.tsx", "w") as f:
    f.write(code)
