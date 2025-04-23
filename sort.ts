/**
 * Sort codes so that
 *   1.  "ACB-…"  come first (numerical order)
 *   2.  "ABC-…"  come next  (numerical order)
 *   3.  "ABC(A)-…" come last (numerical order)
 */
export function sortCodes(codes: string[]): string[] {
  // helper: classify each code
  const getRank = (code: string): number => {
    if (code.startsWith("ACB-")) return 0;          // highest priority
    if (/^ABC-\d/.test(code))  return 1;            // plain “ABC-”
    if (code.startsWith("ABC(A)-")) return 2;       // “ABC(A)-”
    return 3;                                       // anything else
  };

  // helper: pull out the trailing number (defaults to Infinity if none)
  const getNum = (code: string): number => {
    const match = code.match(/(\d+)$/);
    return match ? Number(match[1]) : Number.POSITIVE_INFINITY;
  };

  // stable sort by [rank, number]
  return [...codes].sort((a, b) => {
    const rankDiff = getRank(a) - getRank(b);
    return rankDiff !== 0 ? rankDiff : getNum(a) - getNum(b);
  });
}
