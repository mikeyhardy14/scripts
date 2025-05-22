// components/RunCompletion.tsx
'use client';

import { useEffect, useState } from 'react';

const POLL_MS = 5_000;          // adjust as needed

export default function RunCompletion() {
  const [pct, setPct] = useState<number | null>(null);
  const [errored, setErrored] = useState(false);

  // --- poll every POLL_MS ------------------------------------
  useEffect(() => {
    let timer: NodeJS.Timeout;

    async function poll() {
      try {
        const res = await fetch('/statusJson', { cache: 'no-store' });
        if (!res.ok) throw new Error('network - ' + res.status);
        const data = await res.json();

        const value = Number(data?.RunCompletionPercentage);
        if (Number.isFinite(value)) {
          setPct(Math.min(Math.max(value, 0), 100)); // clamp 0-100
          setErrored(false);
        } else {
          setErrored(true);
        }
      } catch {
        setErrored(true);
      } finally {
        timer = setTimeout(poll, POLL_MS);
      }
    }

    poll();
    return () => clearTimeout(timer);
  }, []);

  // --- choose colour -----------------------------------------
  const colour = (() => {
    if (pct === 100) return '#ffffff';                 // white at 100 %
    if (pct !== null) {
      const hue = (pct / 100) * 120;                  // 0 = red, 120 = green
      return `hsl(${hue},100%,45%)`;
    }
    return undefined;
  })();

  // --- render -------------------------------------------------
  if (errored || pct === null) {
    return <i className="fa-solid fa-link-slash" title="No connection" />;
  }

  return (
    <span
      style={{ color: colour, transition: 'color 0.3s linear', fontWeight: 600 }}
      title={`${pct}% complete`}
    >
      {pct}%
    </span>
  );
}