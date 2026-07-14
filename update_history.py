import re

filepath = 'src/pages/Tasks.tsx'
with open(filepath, 'r') as f:
    text = f.read()

# Replace the History query
# from:
# const q = query(
#   collection(db, "users", auth.currentUser!.uid, "tasks"),
#   orderBy("completedAt", "desc"),
#   limit(50)
# );
# to:
# const q = query(
#   collection(db, "submissions"),
#   where("userId", "==", auth.currentUser!.uid),
#   orderBy("submittedAt", "desc"),
#   limit(50)
# );

new_query = """const q = query(
          collection(db, "submissions"),
          where("userId", "==", auth.currentUser!.uid),
          orderBy("submittedAt", "desc"),
          limit(50)
        );"""

text = re.sub(r'const q = query\(\s*collection\(db, "users", auth\.currentUser!\.uid, "tasks"\),\s*orderBy\("completedAt", "desc"\),\s*limit\(50\)\s*\);', new_query, text)

# Also fix the import, ensure where is imported
if 'where,' not in text and 'where } from \'firebase/firestore\'' not in text:
    text = text.replace("import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';", "import { collection, getDocs, query, orderBy, limit, where } from 'firebase/firestore';")

with open(filepath, 'w') as f:
    f.write(text)

print("Updated query!")
