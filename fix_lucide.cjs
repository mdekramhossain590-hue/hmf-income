const fs = require('fs');
let code = fs.readFileSync('src/pages/Dashboard.tsx', 'utf-8');
code = code.replace('import { Clock, XCircle,  useNavigate } from "react-router-dom";', 'import { useNavigate } from "react-router-dom";');
code = code.replace('import {\n  User, Bell', 'import {\n  Clock, XCircle, User, Bell');
fs.writeFileSync('src/pages/Dashboard.tsx', code);
