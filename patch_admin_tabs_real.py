import re

with open("src/pages/Admin.tsx", "r") as f:
    code = f.read()

# Replace the "Section Accessible" block with actual tabs.
new_tabs_code = """
            {activeTab === 'jobs' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight mb-4">Manage Jobs</h3>
                <div className="space-y-3">
                  {jobs.map(job => (
                    <div key={job.id} className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-700 flex justify-between items-center">
                      <div>
                        <p className="font-bold text-slate-800 dark:text-white">{job.title || 'Untitled Job'}</p>
                        <p className="text-xs text-slate-500">Reward: ৳{job.reward} • Capacity: {job.capacity}</p>
                      </div>
                      <button onClick={async () => {
                        if (confirm('Delete this job?')) {
                          await deleteDoc(doc(db, 'jobs', job.id));
                          toast.success('Job deleted');
                        }
                      }} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                        <Trash className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {jobs.length === 0 && <div className="text-center py-10 text-slate-500">No jobs found.</div>}
                </div>
              </div>
            )}

            {activeTab === 'submissions' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight mb-4">Task Submissions</h3>
                <div className="space-y-3">
                  {submissions.map(sub => (
                    <div key={sub.id} className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-700 flex justify-between items-center">
                      <div>
                        <p className="font-bold text-slate-800 dark:text-white">User: {sub.userEmail || 'Unknown'}</p>
                        <p className="text-xs text-slate-500">Task: {sub.taskTitle} • Status: {sub.status}</p>
                      </div>
                      <div className="flex gap-2">
                        {sub.status === 'pending' && (
                          <>
                            <button onClick={async () => {
                              await updateDoc(doc(db, 'submissions', sub.id), { status: 'approved' });
                              toast.success('Approved');
                            }} className="p-2 text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg">
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button onClick={async () => {
                              await updateDoc(doc(db, 'submissions', sub.id), { status: 'rejected' });
                              toast.success('Rejected');
                            }} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                  {submissions.length === 0 && <div className="text-center py-10 text-slate-500">No submissions found.</div>}
                </div>
              </div>
            )}

            {activeTab === 'drives' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight mb-4">Drive Offers</h3>
                <div className="space-y-3">
                  {drives.map(drive => (
                    <div key={drive.id} className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-700 flex justify-between items-center">
                      <div>
                        <p className="font-bold text-slate-800 dark:text-white">{drive.title || 'Untitled Offer'}</p>
                        <p className="text-xs text-slate-500">Price: ৳{drive.price} • Commission: ৳{drive.commission}</p>
                      </div>
                      <button onClick={async () => {
                        if (confirm('Delete this offer?')) {
                          await deleteDoc(doc(db, 'drive_offers', drive.id));
                          toast.success('Offer deleted');
                        }
                      }} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                        <Trash className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {drives.length === 0 && <div className="text-center py-10 text-slate-500">No drive offers found.</div>}
                </div>
              </div>
            )}

            {activeTab === 'courses' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight mb-4">Manage Courses</h3>
                <div className="space-y-3">
                  {courses.map(course => (
                    <div key={course.id} className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-700 flex justify-between items-center">
                      <div>
                        <p className="font-bold text-slate-800 dark:text-white">{course.title || 'Untitled Course'}</p>
                        <p className="text-xs text-slate-500">Price: ৳{course.price}</p>
                      </div>
                      <button onClick={async () => {
                        if (confirm('Delete this course?')) {
                          await deleteDoc(doc(db, 'courses', course.id));
                          toast.success('Course deleted');
                        }
                      }} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                        <Trash className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {courses.length === 0 && <div className="text-center py-10 text-slate-500">No courses found.</div>}
                </div>
              </div>
            )}

            {activeTab === 'gifts' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight mb-4">Gift Codes</h3>
                <div className="space-y-3">
                  {gifts.map(gift => (
                    <div key={gift.id} className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-700 flex justify-between items-center">
                      <div>
                        <p className="font-bold text-slate-800 dark:text-white">{gift.code}</p>
                        <p className="text-xs text-slate-500">Reward: ৳{gift.reward} • Uses: {gift.currentUses}/{gift.maxUses}</p>
                      </div>
                      <button onClick={async () => {
                        if (confirm('Delete this code?')) {
                          await deleteDoc(doc(db, 'giftCodes', gift.id));
                          toast.success('Code deleted');
                        }
                      }} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                        <Trash className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {gifts.length === 0 && <div className="text-center py-10 text-slate-500">No gift codes found.</div>}
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight mb-4 flex items-center justify-between">
                  App Settings
                  <select 
                    className="text-sm bg-slate-100 dark:bg-slate-700 border-none rounded-xl px-4 py-2 font-bold outline-none ring-2 ring-indigo-500/50"
                    onChange={async (e) => {
                      const snap = await getDoc(doc(db, "settings", e.target.value));
                      if (snap.exists()) {
                        setSiteConfig(snap.data());
                      } else {
                        setSiteConfig({});
                      }
                      (window as any).currentSettingCollection = e.target.value;
                    }}
                  >
                    <option value="site">Site Details (site)</option>
                    <option value="withdraw">Withdraw Limits (withdraw)</option>
                    <option value="deposit">Deposit Limits (deposit)</option>
                    <option value="partner">Partner Settings (partner)</option>
                    <option value="adsIncome">Ads Income (adsIncome)</option>
                    <option value="games">Games (games)</option>
                    <option value="referral">Referral (referral)</option>
                    <option value="faqs">FAQs (faqs)</option>
                  </select>
                </h3>
                <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <p className="text-xs text-slate-500 mb-2 font-bold">Edit Configuration (Advanced JSON Editor)</p>
                  <textarea 
                    className="w-full h-[400px] bg-slate-800 text-green-400 p-4 rounded-xl font-mono text-sm border-none outline-none focus:ring-2 focus:ring-indigo-500 resize-y whitespace-pre-wrap break-all"
                    defaultValue={JSON.stringify(siteConfig, null, 2)}
                    key={JSON.stringify(siteConfig)}
                    onBlur={(e) => {
                      try {
                        const parsed = JSON.parse(e.target.value);
                        setSiteConfig(parsed);
                      } catch (err) {
                        toast.error("Invalid JSON format! Please check for missing commas or quotes.");
                      }
                    }}
                  />
                  <p className="text-[10px] text-slate-400 mt-2">* Click outside the text box to validate JSON before saving.</p>
                  <button 
                    onClick={async () => {
                      try {
                        const colName = (window as any).currentSettingCollection || 'site';
                        await setDoc(doc(db, 'settings', colName), siteConfig, { merge: false });
                        toast.success(`Settings for ${colName} saved!`);
                      } catch (err: any) {
                        toast.error(err.message);
                      }
                    }}
                    className="mt-4 w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-500/30"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            )}
"""

pattern = r"\{?\['jobs', 'submissions', 'drives', 'courses', 'gifts', 'settings'\].includes\(activeTab\) && \([\s\S]*?This section is available in the database but currently uses the default view in the restored panel[\s\S]*?</div>\s*\)\}?"

code = re.sub(pattern, new_tabs_code, code)

if "deleteDoc" not in code:
    code = code.replace("updateDoc,", "updateDoc, deleteDoc, setDoc,")
if "setDoc" not in code:
    code = code.replace("updateDoc,", "updateDoc, setDoc,")
if "Trash" not in code:
    code = code.replace("Shield,", "Shield, Trash,")

with open("src/pages/Admin.tsx", "w") as f:
    f.write(code)

print("Replaced settings UI placeholder with real tabs!")
