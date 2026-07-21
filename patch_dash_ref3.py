import re

with open('src/pages/Dashboard.tsx', 'r') as f:
    code = f.read()

repl = """
              const isTask = activity.type === "task";
              const isReferral = activity.type === "referral";
              const isWithdraw = !isTask && !isReferral && activity.type === "withdraw";
              const isDeposit = !isTask && !isReferral && activity.type === "deposit";

              let title = "";
              let rewardStr = "";
              let badgeColor = "";
              let IconComponent = CheckCircle;
              let statusLabel = "";
              let statusColor = "";

              // Fix reward value formatting by falling back
              const displayAmount = parseFloat(
                activity.reward || activity.amount || activity.bonusEarned || 0,
              ).toFixed(2);

              if (isReferral) {
                title = (language === "Bengali" ? "রেফারেল: " : "Referral: ") + (activity.referredName || "User");
                rewardStr = `+৳${displayAmount}`;
                badgeColor = "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400";
                IconComponent = CheckCircle;
                statusLabel = language === "Bengali" ? "সম্পন্ন" : "Completed";
                statusColor = "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30";
              } else if (isTask) {
"""

code = re.sub(r'const isTask = activity\.type === "task";[\s\S]*?if \(isTask\) \{', repl.strip() + ' {', code)

with open('src/pages/Dashboard.tsx', 'w') as f:
    f.write(code)

