'use client';

import { useState, useMemo, KeyboardEvent } from 'react';
import Link from 'next/link';
import { FaCity, FaLandmark } from 'react-icons/fa';   // ← pick any icons you like
import styles from './SearchBar.module.css';          // optional CSS-module

// --- hard-coded demo data (swap for API / props) ---------------------------
const NJ_LIST = ['Atlantic City', 'Cape May', 'Hoboken', 'Trenton', 'Princeton'];
const NY_LIST = ['Albany', 'Buffalo', 'Ithaca', 'Rochester', 'Syracuse', 'Yonkers'];

/** Internal helper so we can tag each name with its origin */
type Entry = { name: string; list: 'NJ' | 'NY' };

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [highlight, setHighlight] = useState(0);          // arrow-key selection index

  /** All matches, memoised so it only recomputes when query changes */
  const matches: Entry[] = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();

    // filter each list, then merge & slice the first 7
    const fromNj = NJ_LIST.filter(n => n.toLowerCase().includes(q))
                          .map(name => ({ name, list: 'NJ' as const }));
    const fromNy = NY_LIST.filter(n => n.toLowerCase().includes(q))
                          .map(name => ({ name, list: 'NY' as const }));

    return [...fromNj, ...fromNy].slice(0, 7);
  }, [query]);

  // basic ↑ ↓ ↵ keyboard support
  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!matches.length) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlight(i => (i + 1) % matches.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlight(i => (i - 1 + matches.length) % matches.length);
    } else if (e.key === 'Enter') {
      const choice = matches[highlight];
      if (choice) {
        window.location.href =
          choice.list === 'NJ'
            ? `/NJ/${encodeURIComponent(choice.name)}`
            : `/NY/${encodeURIComponent(choice.name)}`;
      }
    }
  };

  return (
    <div className={styles.wrapper}>
      <input
        type="text"
        placeholder="Search cities…"
        value={query}
        onChange={e => {
          setQuery(e.target.value);
          setHighlight(0);     // reset arrow selection
        }}
        onKeyDown={handleKey}
        className={styles.input}
      />

      {matches.length > 0 && (
        <ul className={styles.dropdown}>
          {matches.map((m, idx) => (
            <li key={m.list + m.name}
                className={`${styles.item} ${idx === highlight ? styles.active : ''}`}>
              <Link
                href={m.list === 'NJ' ? `/NJ/${m.name}` : `/NY/${m.name}`}
                onClick={() => setQuery('')}   // optional: clear search after click
              >
                {m.list === 'NJ' ? <FaCity className={styles.icon} /> : <FaLandmark className={styles.icon} />}
                {m.name}
              </Link>
            </li>
          ))}
        </ul>
      )}

      {/* fallback icon when no results */}
      {query && matches.length === 0 && (
        <div className={styles.noResults}>
          <i className="fa-solid fa-link-slash" />  No match
        </div>
      )}
    </div>
  );
}