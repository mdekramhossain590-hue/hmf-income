const fs = require('fs');
let code = fs.readFileSync('src/pages/Tasks.tsx', 'utf-8');

code = code.replace(`  useEffect(() => {
    if (!auth.currentUser) return;
    
    // Fetch History
    const loadData = async (forceRefresh = false) => {`, `  // Fetch History
  const loadData = async (forceRefresh = false) => {
    if (!auth.currentUser) return;`);

fs.writeFileSync('src/pages/Tasks.tsx', code);
