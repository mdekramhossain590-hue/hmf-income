const fs = require('fs');
let code = fs.readFileSync('src/pages/Tasks.tsx', 'utf-8');

// Fix React namespace issue
if (!code.includes("import React")) {
  code = code.replace("import { useState, useEffect } from 'react';", "import React, { useState, useEffect } from 'react';");
}

// Move loadData out of useEffect
code = code.replace(/  useEffect\(\(\) => \{\n    if \(\!auth\.currentUser\) return;\n\n    \/\/ Fetch History\n    const loadData \= async \(forceRefresh \= false\) => \{/g, `  // Fetch History
  const loadData = async (forceRefresh = false) => {
    if (!auth.currentUser) return;
`);

code = code.replace(/    \};\n    loadData\(\);\n  \}, \[\]\);/g, `  };

  useEffect(() => {
    loadData();
  }, []);`);

fs.writeFileSync('src/pages/Tasks.tsx', code);
