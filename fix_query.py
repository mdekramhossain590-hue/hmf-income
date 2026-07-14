import re

filepath = 'src/pages/Tasks.tsx'
with open(filepath, 'r') as f:
    text = f.read()

# Replace the History query
old_query = """const q = query(
          collection(db, "submissions"),
          where("userId", "==", auth.currentUser!.uid),
          orderBy("submittedAt", "desc"),
          limit(50)
        );"""

new_query = """const q = query(
          collection(db, "submissions"),
          where("userId", "==", auth.currentUser!.uid),
          limit(100)
        );"""

if old_query in text:
    text = text.replace(old_query, new_query)
    
    # We should also sort client side since we removed orderBy
    # Find setTaskHistory
    old_set = "setTaskHistory(taskSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));"
    new_set = """const historyData = taskSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
        historyData.sort((a, b) => {
          const aTime = a.submittedAt?.toMillis?.() || 0;
          const bTime = b.submittedAt?.toMillis?.() || 0;
          return bTime - aTime;
        });
        setTaskHistory(historyData);"""
        
    text = text.replace(old_set, new_set)
    
    with open(filepath, 'w') as f:
        f.write(text)
    print("Fixed query!")
else:
    print("Old query not found!")
