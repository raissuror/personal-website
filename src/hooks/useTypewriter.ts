import { useEffect, useState } from 'react';

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/**
 * Reveals `text` a character at a time. Mount a fresh instance (e.g. via `key`) for new text.
 * `finish()` reveals the rest immediately.
 */
export function useTypewriter(text: string, charsPerSecond = 50) {
  const [count, setCount] = useState(() => (prefersReducedMotion() ? text.length : 0));

  useEffect(() => {
    if (count >= text.length) return;
    const id = window.setTimeout(() => setCount((c) => c + 1), 1000 / charsPerSecond);
    return () => window.clearTimeout(id);
  }, [count, text.length, charsPerSecond]);

  return {
    shown: text.slice(0, count),
    done: count >= text.length,
    finish: () => setCount(text.length),
  };
}
