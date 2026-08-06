with open('src/pages/Auth.tsx', 'r') as f:
    code = f.read()

target = """        <p className="text-center mt-6 text-sm text-slate-500 dark:text-slate-400 font-medium">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
          <button 
             onClick={() => setIsLogin(!isLogin)} 
             className="text-indigo-600 dark:text-indigo-400 font-bold cursor-pointer hover:underline underline-offset-4 bg-transparent border-none p-0 outline-none transition-colors"
          >
            {isLogin ? 'Sign Up' : 'Log In'}
          </button>
        </p>"""

new = """        {resetStep > 0 ? (
          <p className="text-center mt-6 text-sm text-slate-500 dark:text-slate-400 font-medium">
            <button 
               onClick={() => setResetStep(0)} 
               className="text-indigo-600 dark:text-indigo-400 font-bold cursor-pointer hover:underline underline-offset-4 bg-transparent border-none p-0 outline-none transition-colors"
            >
              Back to Login
            </button>
          </p>
        ) : (
          <p className="text-center mt-6 text-sm text-slate-500 dark:text-slate-400 font-medium">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
            <button 
               onClick={() => setIsLogin(!isLogin)} 
               className="text-indigo-600 dark:text-indigo-400 font-bold cursor-pointer hover:underline underline-offset-4 bg-transparent border-none p-0 outline-none transition-colors"
            >
              {isLogin ? 'Sign Up' : 'Log In'}
            </button>
          </p>
        )}"""

code = code.replace(target, new)
with open('src/pages/Auth.tsx', 'w') as f:
    f.write(code)
