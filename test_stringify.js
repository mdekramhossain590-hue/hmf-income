const obj = {};
obj.a = obj;
try {
  JSON.stringify(obj, (key, value) => {
    return value;
  });
} catch(e) {
  console.log("Error:", e.message);
}
