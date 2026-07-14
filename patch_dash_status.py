import re

filepath = 'src/pages/Dashboard.tsx'
with open(filepath, 'r') as f:
    text = f.read()

old_logic = """              if (isTask) {
                title = activity.title || t("completed_task_activity");
                rewardStr = `+৳${displayAmount}`;
                badgeColor =
                  "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400";
                IconComponent = CheckCircle;
                statusLabel = language === "Bengali" ? "অনুমোদিত" : "Approved";
                statusColor =
                  "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30";
              } else {"""

new_logic = """              if (isTask) {
                title = activity.title || t("completed_task_activity");
                rewardStr = `+৳${displayAmount}`;
                
                const taskStatus = activity.status || 'pending';
                if (taskStatus === 'approved') {
                  badgeColor = "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400";
                  IconComponent = CheckCircle;
                  statusLabel = language === "Bengali" ? "অনুমোদিত" : "Approved";
                  statusColor = "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30";
                } else if (taskStatus === 'rejected') {
                  badgeColor = "bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400";
                  IconComponent = XCircle;
                  statusLabel = language === "Bengali" ? "বাতিল" : "Rejected";
                  statusColor = "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30";
                  rewardStr = `+৳0`;
                } else {
                  badgeColor = "bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400";
                  IconComponent = Clock;
                  statusLabel = language === "Bengali" ? "অপেক্ষমান" : "Pending";
                  statusColor = "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30";
                }
              } else {"""

if old_logic in text:
    text = text.replace(old_logic, new_logic)
    with open(filepath, 'w') as f:
        f.write(text)
    print("Replaced logic in Dashboard!")
else:
    print("Old logic not found!")

# We also need to fix the date mapping for task in getCombinedActivity
old_date = """      ...userTasks.map((t) => {
        const d = t.completedAt?.toDate
          ? t.completedAt.toDate()
          : t.completedAt
            ? new Date(t.completedAt)
            : new Date(0);"""

new_date = """      ...userTasks.map((t) => {
        const timeField = t.submittedAt || t.completedAt;
        const d = timeField?.toDate
          ? timeField.toDate()
          : timeField
            ? new Date(timeField)
            : new Date(0);"""

with open(filepath, 'r') as f:
    text = f.read()

if old_date in text:
    text = text.replace(old_date, new_date)
    with open(filepath, 'w') as f:
        f.write(text)
    print("Replaced date logic in Dashboard!")
else:
    print("Old date logic not found!")
