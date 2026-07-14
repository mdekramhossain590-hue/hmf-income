import re

filepath = 'src/pages/Tasks.tsx'
with open(filepath, 'r') as f:
    text = f.read()

old_render = """                  filteredJobs.map((job) => {
                    const Icon = getIcon(job.icon);
                    return (
                      <div key={job.id} className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm hover:shadow-md ring-1 ring-slate-100 dark:ring-slate-700/50 flex flex-col items-center text-center transition-all">"""

new_render = """                  filteredJobs.map((job) => {
                    const Icon = getIcon(job.icon);
                    const userSubmission = taskHistory.find((h: any) => h.jobId === job.id);
                    return (
                      <div key={job.id} className="relative bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm hover:shadow-md ring-1 ring-slate-100 dark:ring-slate-700/50 flex flex-col items-center text-center transition-all overflow-hidden">
                        {userSubmission && (
                          <div className="absolute top-0 right-0">
                             <span className={`text-[8px] px-2 py-0.5 rounded-bl-lg font-black uppercase tracking-widest ${
                               userSubmission.status === 'approved' ? 'bg-emerald-500 text-white' :
                               userSubmission.status === 'rejected' ? 'bg-red-500 text-white' :
                               'bg-amber-500 text-white'
                             }`}>
                               {userSubmission.status || 'pending'}
                             </span>
                          </div>
                        )}"""

if old_render in text:
    text = text.replace(old_render, new_render)
    with open(filepath, 'w') as f:
        f.write(text)
    print("Replaced!")
else:
    print("Old render not found!")
