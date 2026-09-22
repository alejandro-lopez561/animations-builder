import { useEffect, useState } from 'react'
const key = 'animation-builder.theme'
export function useTheme() {
  const [choice, setChoice] = useState(() => {
    try { const saved = localStorage.getItem(key); return ['light', 'dark'].includes(saved) ? saved : null } catch { return null }
  })
  const [systemDark, setSystemDark] = useState(() => matchMedia('(prefers-color-scheme: dark)').matches)
  const theme = choice || (systemDark ? 'dark' : 'light')
  useEffect(() => {
    const media = matchMedia('(prefers-color-scheme: dark)')
    const update = () => setSystemDark(media.matches)
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])
  useEffect(() => { document.documentElement.dataset.theme = theme }, [theme])
  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    setChoice(next)
    try { localStorage.setItem(key, next) } catch { /* Theme still works for this session. */ }
  }
  return { theme, toggleTheme }
}
