with open('src/main.tsx', 'r') as f:
    code = f.read()

code = code.replace("return originalStringify(value, (key, val) => {", "return originalStringify(value, ((key: string, val: any) => {")
code = code.replace("cache.add(val);", "cache.add(val);")
code = code.replace("return val;", "return val;")
code = code.replace("        }\n        return val;\n      });", "        }\n        return val;\n      }) as any);")

with open('src/main.tsx', 'w') as f:
    f.write(code)
print("fixed main")
