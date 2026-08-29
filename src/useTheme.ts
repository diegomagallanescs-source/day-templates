import { useEffect, useState } from 'react';

export type ThemePref = 'system' | 'light' | 'dark';

const STORAGE_KEY = 'day-templates-theme';

function isThemePref(value: string | null): value is 'light' | 'dark' {
  return value === 'light' || value === 'dark';
}

function applyTheme(pref: ThemePref) {
  if (pref === 'system') {
    document.documentElement.removeAttribute('data-theme');
  } else {
    document.documentElement.setAttribute('data-theme', pref);
  }
}

/**
 * Cycles system → light → dark → system. The actual color swap happens in
 * CSS via the data-theme attribute (see index.css) — this hook just owns
 * the attribute and persists the choice. index.html applies the stored
 * value synchronously before paint, so there's no flash on reload.
 */
export function useTheme() {
  const [theme, setTheme] = useState<ThemePref>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return isThemePref(stored) ? stored : 'system';
  });

  useEffect(() => {
    applyTheme(theme);
    if (theme === 'system') {
      localStorage.removeItem(STORAGE_KEY);
    } else {
      localStorage.setItem(STORAGE_KEY, theme);
    }
  }, [theme]);

  function cycle() {
    setTheme((t) => (t === 'system' ? 'light' : t === 'light' ? 'dark' : 'system'));
  }

  return { theme, cycle };
}
