import string

with open("Admin_candidate_4.tsx", "rb") as f:
    data = f.read()

printable = set(string.printable.encode())
filtered = bytes([b for b in data if b in printable])
text = filtered.decode('utf-8')

import_start = text.find("import ")
export_start = text.find("export function AdminPanel")

# search for "      )}\n    </div>\n  );\n}"
idx1 = text.find("  );\n}")
idx2 = text.find("  )\n}")
idx3 = text.find("export async function processRegistrationReferral")

print(f"idx1={idx1}, idx2={idx2}, idx3={idx3}")

