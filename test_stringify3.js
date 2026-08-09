const safeStringify = (obj) => {
  try {
    const cache = new Set();
    return JSON.stringify(obj, (key, value) => {
      if (typeof value === 'object' && value !== null) {
        if (cache.has(value)) return undefined;
        cache.add(value);
      }
      return value;
    });
  } catch (e) {
    console.log("Stringify error", e.message);
    return "{}";
  }
};
class Y2 {}
class Ka {}
const obj = new Y2();
const ka = new Ka();
obj.i = ka;
ka.src = obj;
console.log(safeStringify(obj));
