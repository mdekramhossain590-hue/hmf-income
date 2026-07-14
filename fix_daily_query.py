import re

filepath = 'src/pages/TaskDetail.tsx'
with open(filepath, 'r') as f:
    text = f.read()

text = re.sub(
    r'const dailyQuery = query\([\s\S]*?where\("submittedAt", ">=", twentyFourHoursAgo\),\s*\);\s*const dailySnap = await getDocs\(dailyQuery\);\s*if \(dailySnap\.size >= siteSettings\.dailyTaskLimit\) \{',
    r'''const dailyQuery = query(
          collection(db, "submissions"),
          where("userId", "==", auth.currentUser.uid)
        );
        const dailySnap = await getDocs(dailyQuery);
        const recentCount = dailySnap.docs.filter(d => {
          const t = d.data().submittedAt;
          const time = t?.toMillis ? t.toMillis() : (t?.seconds ? t.seconds * 1000 : 0);
          return time >= twentyFourHoursAgo.getTime();
        }).length;
        if (recentCount >= siteSettings.dailyTaskLimit) {''',
    text
)

with open(filepath, 'w') as f:
    f.write(text)
print("Regex replaced!")
