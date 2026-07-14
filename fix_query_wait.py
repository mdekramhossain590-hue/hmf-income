import re

filepath = 'src/pages/Tasks.tsx'
with open(filepath, 'r') as f:
    text = f.read()

old_query = """        const q = query(
          collection(db, "submissions"),
          where("userId", "==", auth.currentUser!.uid),
          orderBy("submittedAt", "desc"),
          limit(50)
        );
        const taskSnap = await getCachedQuery(q, `tasks_history_${auth.currentUser!.uid}`);
        setTaskHistory(taskSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as any)));"""

new_query = """        const q = query(
          collection(db, "submissions"),
          where("userId", "==", auth.currentUser!.uid),
          limit(100)
        );
        const taskSnap = await getCachedQuery(q, `tasks_history_${auth.currentUser!.uid}`);
        const historyData = taskSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
        historyData.sort((a, b) => {
          const aTime = a.submittedAt?.toMillis?.() || 0;
          const bTime = b.submittedAt?.toMillis?.() || 0;
          return bTime - aTime;
        });
        setTaskHistory(historyData.slice(0, 50));"""

if old_query in text:
    text = text.replace(old_query, new_query)
    with open(filepath, 'w') as f:
        f.write(text)
    print("Fixed query to avoid index!")
else:
    print("Old query not found!")
