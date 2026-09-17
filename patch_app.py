with open('src/App.tsx', 'r') as f:
    content = f.read()

if 'AppReviews' not in content:
    content = content.replace("import { Reviews } from './pages/Reviews';", "import { Reviews } from './pages/Reviews';\nimport { AppReviews } from './pages/AppReviews';")
    content = content.replace('<Route path="/reviews" element={<ActiveGuard><Reviews /></ActiveGuard>} />', '<Route path="/reviews" element={<ActiveGuard><Reviews /></ActiveGuard>} />\n            <Route path="/app-reviews" element={<AppReviews />} />')
    with open('src/App.tsx', 'w') as f:
        f.write(content)
    print("Patched App.tsx")
