import re

filepath = 'src/pages/Dashboard.tsx'
with open(filepath, 'r') as f:
    text = f.read()

old_query = """        const tasksQuery = query(
          tasksRef,
          orderBy("completedAt", "desc"),
          limit(5),
        );
        const taskSnapshot = await getCachedQuery(
          tasksQuery,
          `dashboard_tasks_${auth.currentUser!.uid}`,
        );"""

new_query = """        const tasksQuery = query(
          collection(db, "submissions"),
          where("userId", "==", auth.currentUser!.uid),
          limit(20)
        );
        const taskSnapshot = await getCachedQuery(
          tasksQuery,
          `dashboard_tasks_${auth.currentUser!.uid}`,
        );
        
        // Mock the snapshot behavior to sort locally
        const docs = taskSnapshot.docs;
        docs.sort((a, b) => {
          const aData = a.data();
          const bData = b.data();
          const aTime = aData.submittedAt?.toMillis?.() || 0;
          const bTime = bData.submittedAt?.toMillis?.() || 0;
          return bTime - aTime;
        });
        const limitedDocs = docs.slice(0, 5);
        taskSnapshot.forEach = (cb) => limitedDocs.forEach(cb);"""

if old_query in text:
    text = text.replace(old_query, new_query)
    with open(filepath, 'w') as f:
        f.write(text)
    print("Fixed query in Dashboard.tsx!")
else:
    print("Old query not found!")
