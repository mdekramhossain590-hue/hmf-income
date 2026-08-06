with open('server.ts', 'r') as f:
    code = f.read()

target = """      const apiKey = process.env.UDDOKTAPAY_API_KEY;
      const apiBaseUrl = process.env.UDDOKTAPAY_BASE_URL;
      
      if (!apiKey || !apiBaseUrl) {
         return res.status(500).json({ error: "UddoktaPay API credentials not configured in .env" });
      }

      const baseUrl = req.protocol + '://' + req.get('host');
      const response = await fetch(`${apiBaseUrl}/api/checkout-v2`, {"""

replacement = """      const apiKey = process.env.UDDOKTAPAY_API_KEY;
      let apiBaseUrl = process.env.UDDOKTAPAY_BASE_URL;
      
      if (!apiKey || !apiBaseUrl) {
         return res.status(500).json({ error: "UddoktaPay API credentials not configured in .env" });
      }

      apiBaseUrl = apiBaseUrl.replace(/\\/+$/, '').replace(/\\/api$/, '');

      const baseUrl = req.protocol + '://' + req.get('host');
      const response = await fetch(`${apiBaseUrl}/api/checkout-v2`, {"""

if target in code:
    code = code.replace(target, replacement)
    with open('server.ts', 'w') as f:
        f.write(code)
    print("Fixed API URL in server.ts")
else:
    print("Target not found in server.ts")
