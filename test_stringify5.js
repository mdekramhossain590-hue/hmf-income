const obj = {};
obj.a = obj;
const cache = new Set();
try {
  const result = JSON.stringify(obj, (k, v) => {
    if (typeof v === 'object' && v !== null) {
      if (cache.has(v)) return undefined;
      cache.add(v);
    }
    return v;
  });
  console.log("Success:", result);
} catch(e) {
  console.log("Error with Set:", e.message);
}
