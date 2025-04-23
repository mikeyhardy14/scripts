const codes = [
  "ACB-1",
  "ACB-11",
  "ACB-2",
  "ABC-1",
  "ABC-11",
  "ABC-2",
  "ABC(A)-101",
];

// --- helper functions ---
const rank = (s: string): number =>
  s.startsWith("ACB-") ? 0
: /^ABC-\d/.test(s)     ? 1
: s.startsWith("ABC(A)-") ? 2
: 3;

const num  = (s: string): number =>
  +(s.match(/(\d+)$/)?.[1] ?? Number.POSITIVE_INFINITY);

// --- sort *in place* ---
codes.sort((a, b) => {
  const r = rank(a) - rank(b);
  return r !== 0 ? r : num(a) - num(b);
});

console.log(codes);
// ["ACB-1", "ACB-2", "ACB-11", "ABC-1", "ABC-2", "ABC-11", "ABC(A)-101"]
