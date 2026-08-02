import re

with open('src/pages/Leaderboard.tsx', 'r') as f:
    code = f.read()

new_fetch = """
    const fetchLeaders = async () => {
      try {
        const snap = await getDocs(collection(db, "users"));
        
        const fetchedLeaders = snap.docs.map((doc) => {
          try {
            const data = doc.data();
            const main = Number(data.balances?.main || 0);
            const bonus = Number(data.balances?.bonus || 0);
            const ref = Number(data.balances?.referral || 0);
            
            let taskSum = 0;
            if (data.balances?.tasks && typeof data.balances.tasks === 'object') {
              taskSum = Object.values(data.balances.tasks).reduce((a: any, b: any) => Number(a || 0) + Number(b || 0), 0) as number;
            }
            const totalIncome = main + bonus + ref + taskSum;
            
            return {
              id: doc.id,
              fullName: data.fullName || "User",
              photoURL: data.photoURL || null,
              totalIncome,
              referrals: Number(data.referralCount || data.totalReferrals || 0),
              bonus
            };
          } catch (err) {
            console.warn("Skipping malformed user record:", doc.id, err);
            return null;
          }
        }).filter(Boolean);
        
        fetchedLeaders.sort((a: any, b: any) => b[sortBy] - a[sortBy]);
        setLeaders(fetchedLeaders.slice(0, 100)); // top 100
      } catch (error) {
        console.error("Error fetching leaders:", error);
        setLeaders([]);
      } finally {
        setLoading(false);
      }
    };
"""

code = re.sub(r'const fetchLeaders = async \(\) => \{[\s\S]*?fetchLeaders\(\);', new_fetch.strip() + '\n\n    fetchLeaders();', code)

with open('src/pages/Leaderboard.tsx', 'w') as f:
    f.write(code)
