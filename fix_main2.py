with open('src/main.tsx', 'r') as f:
    code = f.read()

code = code.replace("return val;\n      }, space);", "return val;\n      }) as any, space);")

with open('src/main.tsx', 'w') as f:
    f.write(code)
print("fixed main")
