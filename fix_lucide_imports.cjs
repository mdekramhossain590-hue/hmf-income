const fs = require('fs');
let code = fs.readFileSync('src/pages/Dashboard.tsx', 'utf-8');

code = code.replace('import { Clock, XCircle, User, Bell, Wallet', 'import { Clock, XCircle, User, Bell, Wallet');

// If not present, add them to lucide-react import
if (!code.includes('Clock, XCircle, User, Bell,')) {
    code = code.replace('import {  User, Bell, Wallet', 'import { Clock, XCircle, User, Bell, Wallet');
}

fs.writeFileSync('src/pages/Dashboard.tsx', code);
