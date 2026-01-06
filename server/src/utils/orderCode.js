export function makeOrderCode(prefix = "GA") {
  // GA-20260106-593421
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const rnd = Math.floor(100000 + Math.random() * 900000);
  return `${prefix}-${y}${m}${day}-${rnd}`;
}
