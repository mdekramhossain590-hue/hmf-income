const fs = require('fs');
let code = fs.readFileSync('src/pages/Dashboard.tsx', 'utf-8');

const startStr = "      {/* Earnings Breakdown Section */}";
const endStr = "      {/* Premium Quick Actions */}";

const startIndex = code.indexOf(startStr);
const endIndex = code.indexOf(endStr);

if (startIndex !== -1 && endIndex !== -1) {
  code = code.substring(0, startIndex) + code.substring(endIndex);
  fs.writeFileSync('src/pages/Dashboard.tsx', code);
  console.log('Successfully removed the section');
} else {
  console.log('Could not find start or end string');
}
