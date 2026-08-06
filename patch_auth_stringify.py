import re

with open('src/components/AuthProvider.tsx', 'r') as f:
    code = f.read()

target = """const safeStringify = (obj: any) => {
  try {
    const cache = new Set();
    const str = JSON.stringify(obj, (key, value) => {
      if (typeof value === 'object' && value !== null) {
        if (cache.has(value)) return undefined;
        cache.add(value);
      }
      return value;
    });
    return str;
  } catch (e) {
    console.warn("safeStringify failed:", e);
    // Fallback: strip all complex objects and try again
    try {
      return JSON.stringify(obj, (key, value) => {
        if (typeof value === 'object' && value !== null) {
          if (value.constructor && value.constructor.name !== 'Object' && value.constructor.name !== 'Array') {
            return undefined; // Strip class instances (like Firestore Timestamp, References, React fibers)
          }
        }
        return value;
      });
    } catch (e2) {
      return '{}';
    }
  }
};"""

new = """const safeStringify = (obj: any) => {
  try {
    const cache = new Set();
    return JSON.stringify(obj, (key, value) => {
      if (typeof value === 'object' && value !== null) {
        if (cache.has(value)) return undefined;
        cache.add(value);
        // Strip out complex Firestore objects which cause circular refs or getters throwing
        if (value.constructor && value.constructor.name !== 'Object' && value.constructor.name !== 'Array') {
          return undefined; 
        }
      }
      return value;
    });
  } catch (e) {
    return '{}';
  }
};"""

if target in code:
    code = code.replace(target, new)
    with open('src/components/AuthProvider.tsx', 'w') as f:
        f.write(code)
    print("Fixed safeStringify")
else:
    print("Target not found")
