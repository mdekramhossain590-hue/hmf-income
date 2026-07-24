with open('imports.txt', 'r') as f:
    imports = f.read()

with open('src/pages/Admin.tsx', 'r') as f:
    text = f.read()

export_start = text.find('export function AdminPanel()')
new_text = imports + text[export_start:]

with open('src/pages/Admin.tsx', 'w') as f:
    f.write(new_text)
