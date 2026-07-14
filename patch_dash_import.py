import re

filepath = 'src/pages/Dashboard.tsx'
with open(filepath, 'r') as f:
    text = f.read()

import_statement = "import { Link } from 'react-router-dom';"
if import_statement not in text:
    # Let's see if react-router-dom is already imported
    if "import { useNavigate" in text:
        text = text.replace("import { useNavigate } from 'react-router-dom';", "import { useNavigate, Link } from 'react-router-dom';")
    else:
        text = "import { Link } from 'react-router-dom';\n" + text
        
    with open(filepath, 'w') as f:
        f.write(text)
    print("Imported Link!")
