import os
import re

def fix_server_ts():
    with open('server.ts', 'r') as f:
        code = f.read()
    
    code = code.replace("let firebaseAdminApp;", "let firebaseAdminApp: any;")
    code = code.replace("const data = await res.json();", "const data: any = await res.json();")
    code = code.replace("const db = admin.firestore();", "const db: any = admin.firestore();")
    
    with open('server.ts', 'w') as f:
        f.write(code)

def replace_in_files(pattern, repl):
    for root, dirs, files in os.walk('src'):
        for file in files:
            if file.endswith('.ts') or file.endswith('.tsx'):
                filepath = os.path.join(root, file)
                with open(filepath, 'r') as f:
                    content = f.read()
                new_content = re.sub(pattern, repl, content)
                if new_content != content:
                    with open(filepath, 'w') as f:
                        f.write(new_content)

fix_server_ts()
replace_in_files(r'catch\s*\(\s*([a-zA-Z0-9_]+)\s*\)\s*\{', r'catch (\1: any) {')
replace_in_files(r'catch\s*\(\s*([a-zA-Z0-9_]+)\s*:\s*unknown\s*\)\s*\{', r'catch (\1: any) {')
print("fixed build TS errors")
