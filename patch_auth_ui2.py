import re

with open('src/pages/Auth.tsx', 'r') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "isLogin ? 'Log In' : 'Sign Up'" in line:
        lines[i] = line.replace("isLogin ? 'Log In' : 'Sign Up'", "resetStep === 1 ? 'Send OTP' : resetStep === 2 ? 'Reset Password' : isLogin ? 'Log In' : 'Sign Up'")

with open('src/pages/Auth.tsx', 'w') as f:
    f.writelines(lines)
