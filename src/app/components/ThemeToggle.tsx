'use client'
import { useEffect, useState } from 'react'

type Theme = 'system' | 'light' | 'dark'
const NEXT: Record<Theme, Theme> = { system: 'light', light: 'dark', dark: 'system' }
const LABEL: Record<Theme, string> = { system: 'Auto', light: 'Light', dark: 'Dark' }

// cycles auto / light / dark; the choice is remembered in this browser only
export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('system')

  useEffect(() => {
    try {
      const saved = localStorage.getItem('jirani-theme')
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (saved === 'light' || saved === 'dark') setTheme(saved)
    } catch {}
  }, [])

  function change() {
    const next = NEXT[theme]
    setTheme(next)
    try {
      if (next === 'system') localStorage.removeItem('jirani-theme')
      else localStorage.setItem('jirani-theme', next)
    } catch {}
    if (next === 'system') document.documentElement.removeAttribute('data-theme')
    else document.documentElement.setAttribute('data-theme', next)
  }

  return (
    <button type="button" onClick={change} className="btn-text theme-toggle" aria-label={`Theme: ${LABEL[theme]}. Click to change.`}>
      {LABEL[theme]}
    </button>
  )
}
