try {
  require('motion/react');
  console.log("motion/react loads");
} catch(e) {
  console.log("motion/react fails", e.message);
}
