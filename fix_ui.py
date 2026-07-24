import re

with open('src/pages/TaskDetail.tsx', 'r') as f:
    text = f.read()

# I want to find the confirm modal which contains this text:
# "Please review your proofs before submitting."
# The `form_input` is after that.

# I will find the part after "Please review your proofs before submitting."
parts = text.split("Please review your proofs before submitting.")
if len(parts) == 2:
    # Look for the form_input in parts[1]
    
    # We will just remove the whole {job.requiredProofs?.includes("file") && ( ... )} that has "Document / File Upload *" in parts[1]
    # And replace it with the proper review_preview
    
    import re
    # Match from {job.requiredProofs?.includes("file") && ( up to the matching )}
    # Note: the form_input has a lot of nested divs.
    
    # Let's just find the exact string of the form_input that was injected:
    form_input_regex = r'\{job\.requiredProofs\?\.includes\("file"\) && \(\s*<div className="mb-4">.*?Tap to upload file.*?</label>\s*<input.*?</div>\s*</div>\s*\)\}'
    
    # Actually, simpler: I'll just use regex to remove everything between `{job.requiredProofs?.includes("file") && (` and `              {job.requiredProofs?.includes("username") && (` in parts[1].
    
    modal_part = parts[1]
    
    # Regex to match the added form_input block
    new_modal = re.sub(
        r'\{job\.requiredProofs\?\.includes\("file"\) && \(.*?\{job\.requiredProofs\?\.includes\("username"\) && \(',
        r'{job.requiredProofs?.includes("file") && (genericFile || genericFileUrl) && ( <div> <span className="block text-[11px] font-bold text-slate-400 dark:text-slate-500 mb-2 uppercase tracking-wider"> File Upload </span> <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 p-3"> <div className="flex items-center gap-2 text-blue-500 text-sm font-medium"> <FileIcon className="w-4 h-4" /> {genericFile ? genericFile.name : \'Linked File\'} </div> </div> </div> )} {job.requiredProofs?.includes("username") && (',
        modal_part,
        flags=re.DOTALL
    )
    
    parts[1] = new_modal
    
    new_text = "Please review your proofs before submitting.".join(parts)
    
    # Also we need to remove `review_preview` from the first occurrence!
    # Because my second replace put it there.
    # The first occurrence is BEFORE "Please review your proofs before submitting."
    # Let's look for `File Upload` span in the first part.
    first_part = new_text.split("Please review your proofs before submitting.")[0]
    first_part = re.sub(
        r'\{job\.requiredProofs\?\.includes\("file"\) &&\s*\(genericFile \|\| genericFileUrl\) && \(.*?\{job\.requiredProofs\?\.includes\("username"\) && \(',
        r'{job.requiredProofs?.includes("username") && (',
        first_part,
        flags=re.DOTALL
    )
    
    final_text = first_part + "Please review your proofs before submitting." + new_text.split("Please review your proofs before submitting.")[1]
    
    with open('src/pages/TaskDetail.tsx', 'w') as f:
        f.write(final_text)
    print("Fixed.")
else:
    print("Not found.")

