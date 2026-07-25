const fs = require('fs');
let code = fs.readFileSync('src/pages/Admin.tsx', 'utf8');

const target = `  }, [isAdmin, activeTab]);`;
const replacement = `  }, [isAdmin, activeTab]);

  useEffect(() => {
    loadSettings();
    loadData();
  }, [loadSettings, loadData]);
`;

if (!code.includes('loadSettings();\n    loadData();')) {
  code = code.replace(target, replacement);
  fs.writeFileSync('src/pages/Admin.tsx', code);
  console.log("Added useEffect");
} else {
  console.log("useEffect already exists");
}
