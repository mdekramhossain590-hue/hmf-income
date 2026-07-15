const fs = require('fs');

function addState(file) {
  let code = fs.readFileSync(file, 'utf-8');
  if (!code.includes('const [showCelebration, setShowCelebration] = useState(false);')) {
    code = code.replace(
      'const [loading, setLoading] = useState(false);',
      'const [loading, setLoading] = useState(false);\n  const [showCelebration, setShowCelebration] = useState(false);'
    );
    // If loading is not there, replace something else
    code = code.replace(
      'const { profile',
      'const { profile'
    );
    code = code.replace(
      'export function Dashboard() {\n',
      'export function Dashboard() {\n  const [showCelebration, setShowCelebration] = useState(false);\n'
    );
    code = code.replace(
      'export function PostJob() {\n',
      'export function PostJob() {\n  const [showCelebration, setShowCelebration] = useState(false);\n'
    );
    code = code.replace(
      'export function Spin() {\n',
      'export function Spin() {\n  const [showCelebration, setShowCelebration] = useState(false);\n'
    );
    fs.writeFileSync(file, code);
  }
}

['src/pages/Dashboard.tsx', 'src/pages/PostJob.tsx', 'src/pages/Spin.tsx'].forEach(addState);
