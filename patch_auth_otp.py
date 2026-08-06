import re

with open('src/pages/Auth.tsx', 'r') as f:
    code = f.read()

# Add states
states = """
  const [resetStep, setResetStep] = useState<0 | 1 | 2>(0); // 0 = none, 1 = enter email, 2 = enter OTP and new password
  const [resetOtp, setResetOtp] = useState('');
  const [resetNewPassword, setResetNewPassword] = useState('');
"""
code = code.replace("const [showPassword, setShowPassword] = useState(false);", "const [showPassword, setShowPassword] = useState(false);\n" + states)

# Replace handleForgotPassword
old_forgot = """  const handleForgotPassword = async () => {
    if (!email) {
      toast.error("Please enter your email address first.");
      return;
    }
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success("Password reset email sent! Check your inbox.");
    } catch (error: any) {
      toast.error("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };"""

new_forgot = """  const handleForgotPassword = async () => {
    if (!email) {
      toast.error("Please enter your email address first.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send OTP");
      
      toast.success("OTP sent to your email!");
      setResetStep(2);
    } catch (error: any) {
      toast.error("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtpAndReset = async () => {
    if (!email || !resetOtp || !resetNewPassword) {
      toast.error("Please fill all fields.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: resetOtp, newPassword: resetNewPassword })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to reset password");
      
      toast.success("Password changed successfully! You can now login.");
      setResetStep(0);
      setIsLogin(true);
      setPassword('');
      setResetOtp('');
      setResetNewPassword('');
    } catch (error: any) {
      toast.error("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };"""

code = code.replace(old_forgot, new_forgot)

with open('src/pages/Auth.tsx', 'w') as f:
    f.write(code)

print("Patched auth logic")
