import re

filepath = 'src/pages/Tasks.tsx'
with open(filepath, 'r') as f:
    text = f.read()

old_render = """            taskHistory.map((historyItem) => (
              <div key={historyItem.id} className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 text-green-600 flex items-center justify-center rounded-full">
                    <List className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-[15px] font-display font-bold text-gray-800 dark:text-white">{historyItem.title}</h4>
                    <p className="text-xs text-gray-500">{historyItem.completedAt?.toDate().toLocaleString() || 'Just now'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-display font-black text-green-600 dark:text-green-400">+৳{historyItem.reward}</p>
                </div>
              </div>
            ))"""

new_render = """            taskHistory.map((historyItem) => (
              <div key={historyItem.id} className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 flex items-center justify-center rounded-full ${
                    historyItem.status === 'approved' ? 'bg-green-100 dark:bg-green-900/30 text-green-600' :
                    historyItem.status === 'rejected' ? 'bg-red-100 dark:bg-red-900/30 text-red-600' :
                    'bg-orange-100 dark:bg-orange-900/30 text-orange-600'
                  }`}>
                    <List className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-[15px] font-display font-bold text-gray-800 dark:text-white line-clamp-1">{historyItem.title}</h4>
                    <p className="text-xs text-gray-500">{(historyItem.submittedAt || historyItem.completedAt)?.toDate().toLocaleString() || 'Just now'}</p>
                  </div>
                </div>
                <div className="text-right flex flex-col items-end">
                  <p className={`text-sm font-display font-black ${
                    historyItem.status === 'approved' ? 'text-green-600 dark:text-green-400' :
                    historyItem.status === 'rejected' ? 'text-red-500 line-through' :
                    'text-orange-500'
                  }`}>+৳{historyItem.reward}</p>
                  <span className={`text-[10px] mt-1 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider ${
                    historyItem.status === 'approved' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                    historyItem.status === 'rejected' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                    'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                  }`}>
                    {historyItem.status || 'pending'}
                  </span>
                </div>
              </div>
            ))"""

if old_render in text:
    text = text.replace(old_render, new_render)
    with open(filepath, 'w') as f:
        f.write(text)
    print("Replaced!")
else:
    print("Old render not found!")
