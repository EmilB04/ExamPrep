import { useEffect, useState } from 'react'

export type ThemePreference = 'light' | 'dark' | 'system'
const storageKey = 'masterprep.theme.v1'
const isTheme = (value: unknown): value is ThemePreference =>
  value === 'light' || value === 'dark' || value === 'system'

function readPreference(): ThemePreference {
  try {
    const value = localStorage.getItem(storageKey)
    return isTheme(value) ? value : 'system'
  } catch {
    return 'system'
  }
}

export function useTheme() {
  const [preference, setPreference] = useState<ThemePreference>(readPreference)
  useEffect(() => {
    const media = window.matchMedia?.('(prefers-color-scheme: dark)')
    const apply = () => {
      const resolved =
        preference === 'system'
          ? media?.matches
            ? 'dark'
            : 'light'
          : preference
      document.documentElement.dataset.theme = resolved
      document
        .querySelector('meta[name="theme-color"]')
        ?.setAttribute('content', resolved === 'dark' ? '#142225' : '#f4f7f6')
    }
    apply()
    media?.addEventListener('change', apply)
    return () => media?.removeEventListener('change', apply)
  }, [preference])
  useEffect(() => {
    const sync = (event: StorageEvent) => {
      if (event.key === storageKey || event.key === null)
        setPreference(isTheme(event.newValue) ? event.newValue : 'system')
    }
    window.addEventListener('storage', sync)
    return () => window.removeEventListener('storage', sync)
  }, [])
  function chooseTheme(value: ThemePreference) {
    setPreference(value)
    try {
      localStorage.setItem(storageKey, value)
    } catch {
      /* Theme still works when browser storage is unavailable. */
    }
  }
  return { preference, chooseTheme }
}
