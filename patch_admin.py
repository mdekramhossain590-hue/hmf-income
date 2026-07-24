import re

with open('src/pages/Admin.tsx', 'r') as f:
    text = f.read()

# I need to add `sub.proofs.fileUrl` display next to `sub.proofs.screenshot`

file_display = """
                  {sub.proofs.fileUrl && (
                    <div className="pt-2">
                      <a 
                        href={sub.proofs.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-xs font-black text-white bg-blue-600 dark:bg-blue-500 px-4 py-2 rounded-xl hover:scale-[1.02] active:scale-95 transition-all w-fit shadow-md cursor-pointer"
                      >
                        <FileIcon className="w-3.5 h-3.5" /> View Proof File
                      </a>
                    </div>
                  )}
"""

text = re.sub(
    r'(\{sub\.proofs\.screenshot && \(\s*<div className="pt-2">\s*<button.*?View Proof Image\s*</button>\s*</div>\s*\)\})',
    r'\1' + '\n' + file_display,
    text,
    flags=re.DOTALL
)

# Need to import FileIcon in Admin.tsx if it's not imported
if 'import { File as FileIcon' not in text:
    text = text.replace('import { ', 'import { File as FileIcon, ', 1)

with open('src/pages/Admin.tsx', 'w') as f:
    f.write(text)
