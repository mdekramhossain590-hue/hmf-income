import re

filepath = 'src/pages/Dashboard.tsx'
with open(filepath, 'r') as f:
    text = f.read()

old_header = """        <div className="flex justify-between items-center mb-4 relative z-10">
          <h3 className="font-display font-medium text-slate-800 dark:text-white text-base flex items-center gap-2 tracking-tight">
            <Activity className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
            {t("recent_activity")}
          </h3>
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            {language === "Bengali" ? "রিয়েল-টাইম আপডেট" : "Real-time Updates"}
          </span>
        </div>"""

new_header = """        <div className="flex justify-between items-center mb-4 relative z-10">
          <h3 className="font-display font-medium text-slate-800 dark:text-white text-base flex items-center gap-2 tracking-tight">
            <Activity className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
            {t("recent_activity")}
          </h3>
          <Link to="/activity" className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300">
            {language === "Bengali" ? "সব দেখুন" : "View All"}
          </Link>
        </div>"""

if old_header in text:
    text = text.replace(old_header, new_header)
    with open(filepath, 'w') as f:
        f.write(text)
    print("Patched Dashboard.tsx for View All link!")
else:
    print("Old header not found!")
