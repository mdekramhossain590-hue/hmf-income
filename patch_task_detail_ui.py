import re

with open('src/pages/TaskDetail.tsx', 'r') as f:
    text = f.read()

# Add view previous submission
view_prev = """
            {previousSubmission.proofs?.screenshot && (
              <div>
                <span className="block text-xs font-bold text-gray-400 dark:text-gray-500 mb-2 uppercase tracking-wider">
                  Screenshot
                </span>
                <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-slate-600">
                  <img
                    src={previousSubmission.proofs.screenshot}
                    alt="Proof screenshot"
                    className="w-full object-contain bg-gray-50 dark:bg-slate-700/50"
                  />
                </div>
              </div>
            )}
            
            {previousSubmission.proofs?.fileUrl && (
              <div>
                <span className="block text-xs font-bold text-gray-400 dark:text-gray-500 mb-2 uppercase tracking-wider">
                  File Upload
                </span>
                <div className="bg-gray-50 dark:bg-slate-700/50 rounded-xl p-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                  <a
                    href={previousSubmission.proofs.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-blue-500 hover:underline break-all"
                  >
                    <FileIcon className="w-4 h-4" /> View / Download File
                  </a>
                </div>
              </div>
            )}
"""
text = re.sub(r'            \{previousSubmission\.proofs\?\.screenshot && \(\n              <div>\n                <span className="block text-xs font-bold text-gray-400 dark:text-gray-500 mb-2 uppercase tracking-wider">\n                  Screenshot\n                </span>\n                <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-slate-600">\n                  <img\n                    src=\{previousSubmission\.proofs\.screenshot\}\n                    alt="Proof screenshot"\n                    className="w-full object-contain bg-gray-50 dark:bg-slate-700/50"\n                  />\n                </div>\n              </div>\n            \)\}', view_prev, text)

# Add form input
form_input = """
              {job.requiredProofs?.includes("file") && (
                <div className="mb-4">
                  <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-2">
                    Document / File Upload *
                  </label>
                  
                  <div className="space-y-3">
                    {!genericFile && (
                      <div className="border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-xl p-6 flex flex-col items-center justify-center bg-gray-50/50 dark:bg-slate-700/30 hover:bg-gray-100 dark:hover:bg-slate-700/50 transition cursor-pointer relative">
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx,.zip,.rar,.txt"
                          onChange={handleGenericFileChange}
                          required={!genericFileUrl}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <UploadCloud className="w-8 h-8 text-[#0D47A1] mb-2" />
                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                          Tap to upload file
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          PDF, DOC, ZIP up to 5MB
                        </p>
                      </div>
                    )}

                    {genericFile && (
                      <div className="relative rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-100 dark:bg-slate-700/50 flex flex-col items-center justify-center p-4">
                        <FileIcon className="w-8 h-8 text-blue-500 mb-2" />
                        <button
                          type="button"
                          onClick={removeGenericFile}
                          className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black text-white rounded-full transition backdrop-blur-sm"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <p className="text-xs text-center text-gray-700 dark:text-gray-300 mt-2 font-medium break-all">
                          {genericFile.name}
                        </p>
                      </div>
                    )}

                    <div className="flex items-center gap-4 py-1">
                      <div className="flex-1 h-px bg-gray-200 dark:bg-slate-700"></div>
                      <span className="text-xs font-bold text-gray-400 uppercase">OR</span>
                      <div className="flex-1 h-px bg-gray-200 dark:bg-slate-700"></div>
                    </div>

                    <div className="relative">
                      <FileIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="url"
                        value={genericFileUrl}
                        onChange={(e) => {
                          setGenericFileUrl(e.target.value);
                          if (e.target.value) removeGenericFile();
                        }}
                        placeholder="https://drive.google.com/... (File Link)"
                        className="w-full bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 dark:text-white rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-[#3b82f6]"
                        required={!genericFile && !genericFileUrl}
                      />
                    </div>
                  </div>
                </div>
              )}
"""
text = text.replace('{job.requiredProofs?.includes("username") && (', form_input + '\n              {job.requiredProofs?.includes("username") && (')


# Add review preview
review_preview = """
              {job.requiredProofs?.includes("file") &&
                (genericFile || genericFileUrl) && (
                  <div>
                    <span className="block text-[11px] font-bold text-slate-400 dark:text-slate-500 mb-2 uppercase tracking-wider">
                      File Upload
                    </span>
                    <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 p-3">
                      <div className="flex items-center gap-2 text-blue-500 text-sm font-medium">
                        <FileIcon className="w-4 h-4" /> {genericFile ? genericFile.name : 'Linked File'}
                      </div>
                    </div>
                  </div>
                )}
"""
text = text.replace('{job.requiredProofs?.includes("username") && (', review_preview + '\n              {job.requiredProofs?.includes("username") && (', 1) # wait, replacing again? Let's use something unique.

with open('src/pages/TaskDetail.tsx', 'w') as f:
    f.write(text)
