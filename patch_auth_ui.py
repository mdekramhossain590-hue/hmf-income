import re

with open('src/pages/Auth.tsx', 'r') as f:
    code = f.read()

target = """        <h2 className="text-2xl font-bold mb-6 text-slate-800 dark:text-white tracking-tight">{isLogin ? 'Welcome Back' : 'Create Account'}</h2>"""

new_header = """        <h2 className="text-2xl font-bold mb-6 text-slate-800 dark:text-white tracking-tight">
          {resetStep === 1 ? 'Reset Password' : resetStep === 2 ? 'Enter OTP' : isLogin ? 'Welcome Back' : 'Create Account'}
        </h2>"""

code = code.replace(target, new_header)

target_form = """        <form onSubmit={handleSubmit} className="space-y-4">"""

new_form = """        <form onSubmit={e => { e.preventDefault(); if (resetStep === 2) handleVerifyOtpAndReset(); else if (resetStep === 1) handleForgotPassword(); else handleSubmit(e); }} className="space-y-4">"""

code = code.replace(target_form, new_form)

target_inputs = """          {!isLogin && ("""

new_inputs = """
          {resetStep === 1 ? (
            <input
              type="email"
              placeholder="Enter your Email Address"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3.5 text-base text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          ) : resetStep === 2 ? (
            <>
              <input
                type="text"
                placeholder="Enter 6-digit OTP"
                required
                value={resetOtp}
                onChange={(e) => setResetOtp(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3.5 text-base text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
              <div className="relative mt-3">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="New Password"
                  required
                  value={resetNewPassword}
                  onChange={(e) => setResetNewPassword(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3.5 pr-12 text-base text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 focus:outline-none"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </>
          ) : (
            <>
              {!isLogin && ("""

code = code.replace(target_inputs, new_inputs)

target_end_inputs = """            />
          )}"""

new_end_inputs = """            />
          )}
          </>
          )}"""

code = code.replace(target_end_inputs, new_end_inputs, 1) # Only first occurrence

target_forgot = """                onClick={handleForgotPassword}"""
new_forgot = """                onClick={() => setResetStep(1)}"""
code = code.replace(target_forgot, new_forgot)

target_btn = """          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white font-bold py-3.5 rounded-xl shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
          </button>"""

new_btn = """          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white font-bold py-3.5 rounded-xl shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {loading ? 'Processing...' : (resetStep === 1 ? 'Send OTP' : resetStep === 2 ? 'Reset Password' : isLogin ? 'Sign In' : 'Create Account')}
          </button>"""

code = code.replace(target_btn, new_btn)

target_footer = """        <div className="mt-6 text-center text-sm font-medium">"""
new_footer = """        {resetStep > 0 && (
          <div className="mt-4 text-center">
             <button onClick={() => setResetStep(0)} className="text-sm font-medium text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
               Back to Login
             </button>
          </div>
        )}
        {resetStep === 0 && (
          <div className="mt-6 text-center text-sm font-medium">"""
code = code.replace(target_footer, new_footer)

target_end_footer = """        </div>
      </div>
    </div>
  );"""
new_end_footer = """        </div>
        )}
      </div>
    </div>
  );"""
code = code.replace(target_end_footer, new_end_footer)


with open('src/pages/Auth.tsx', 'w') as f:
    f.write(code)

print("Patched auth ui")
