const safeStringify = (obj) => {
  try {
    const cache = new Set();
    return JSON.stringify(obj, (key, value) => {
      if (typeof value === 'object' && value !== null) {
        if (cache.has(value)) return undefined;
        cache.add(value);
        if (value.constructor && value.constructor.name !== 'Object' && value.constructor.name !== 'Array') {
          return undefined; 
        }
      }
      return value;
    });
  } catch (e) {
    console.error("Stringify error", e);
    return "{}";
  }
};
const obj = {};
obj.a = obj;
console.log(safeStringify(obj));
