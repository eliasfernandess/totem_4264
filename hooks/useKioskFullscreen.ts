'use client'

import { useEffect, useCallback, useState } from 'react'

export function useKioskFullscreen() {
  const [emFullscreen, setEmFullscreen] = useState(false)

  const entrarFullscreen = useCallback(async () => {
    const el = document.documentElement as HTMLElement & {
      webkitRequestFullscreen?: () => Promise<void>
      mozRequestFullScreen?: () => Promise<void>
    }
    try {
      if (el.requestFullscreen) await el.requestFullscreen()
      else if (el.webkitRequestFullscreen) await el.webkitRequestFullscreen()
      else if (el.mozRequestFullScreen) await el.mozRequestFullScreen()
    } catch { /* ignorado — sem gesto do usuário */ }
  }, [])

  useEffect(() => {
    const verificar = () => {
      const esta = !!(document.fullscreenElement || (document as any).webkitFullscreenElement)
      setEmFullscreen(esta)
      if (!esta) setTimeout(() => entrarFullscreen(), 300)
    }

    const bloquearTeclas = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'F11') {
        e.preventDefault()
        e.stopImmediatePropagation()
      }
      if ((e.altKey && e.key === 'F4') || (e.ctrlKey && e.key === 'w')) {
        e.preventDefault()
      }
    }

    document.addEventListener('fullscreenchange', verificar)
    document.addEventListener('webkitfullscreenchange', verificar)
    document.addEventListener('keydown', bloquearTeclas, true)
    document.addEventListener('contextmenu', (e) => e.preventDefault())
    verificar()

    return () => {
      document.removeEventListener('fullscreenchange', verificar)
      document.removeEventListener('webkitfullscreenchange', verificar)
      document.removeEventListener('keydown', bloquearTeclas, true)
    }
  }, [entrarFullscreen])

  return { emFullscreen, entrarFullscreen }
}
