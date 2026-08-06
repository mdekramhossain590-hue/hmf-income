with open('server.ts', 'r') as f:
    code = f.read()

start_marker = '      return res.status(500).json({ error: "Failed to reset password" });\n    }\n  });'
end_marker = '  app.post("/api/uddoktapay/create"'

start = code.find(start_marker)
if start != -1:
    end = code.find(end_marker, start)
    if end != -1:
        code = code[:start + len(start_marker)] + '\n\n' + code[end:]

with open('server.ts', 'w') as f:
    f.write(code)

