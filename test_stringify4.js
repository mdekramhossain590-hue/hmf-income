const obj = {};
obj.a = obj;
try {
  JSON.stringify(obj, (k, v) => {
    return v;
  });
} catch(e) {
  console.log("Error inside:", e.message);
}
