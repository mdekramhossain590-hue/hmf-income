import re
with open("src/pages/Admin.tsx", "r") as f:
    code = f.read()

btn = """Delete Duplicate Admins
            </button>
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); fixExploit(); }}
              className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold ml-2"
            >
              Fix Spin/Math Exploit
            </button>"""

code = re.sub(r'Delete Duplicate Admins\s*</button>', btn, code)

with open("src/pages/Admin.tsx", "w") as f:
    f.write(code)
