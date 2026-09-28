import { useState, useEffect } from 'react'

export function useLocalStorage(key, initial) {
  const [value, setValue] = useState(() => {
    try {
      const s = localStorage.getItem(key)
      return s !== null ? JSON.parse(s) : initial
    } catch { return initial }
  })
  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(value)) } catch { /* ignore */ }
  }, [key, value])
  return [value, setValue]
}
