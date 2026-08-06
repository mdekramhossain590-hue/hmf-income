with open('src/pages/Auth.tsx', 'r') as f:
    code = f.read()

target = """          )}
          
          <button """

new = """          )}
          </>
          )}
          
          <button """

code = code.replace(target, new)

with open('src/pages/Auth.tsx', 'w') as f:
    f.write(code)
