'use client'

import { useEffect, useCallback, useState, useRef } from 'react'

export function useKioskFullscreen() {
  // Começa como true (otimista) — evita flash do guard no mount/navegação
  const [emFullscreen, setEmFullscreen] = useState(true)
  const guardTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const entrarFullscreen = useCallback(async () => {
    const el = document.documentElement as HTMLElement & {
      webkitRequestFullscreen?: () => Promise<void>
      mozRequestFullScreen?: () => Promise<void>
    }
    try {
      if (el.requestFullscreen) await el.requestFullscreen()
      else if (el.webkitRequestFullscreen) await el.webkitRequestFullscreen()
      else if (el.mozRequestFullScreen) await el.mozRequestFullScreen()
    } catch { /* sem gesto do usuário — ignorado */ }
  }, [])

  useEffect(() => {
    const estaEmFullscreen = () =>
      !!(document.fullscreenElement || (document as any).webkitFullscreenElement)

    const verificar = () => {
      const esta = estaEmFullscreen()

      if (esta) {
        // Entrou em fullscreen — cancela qualquer timer pendente e libera
        if (guardTimerRef.current) clearTimeout(guardTimerRef.current)
        setEmFullscreen(true)
        return
      }

      // Saiu do fullscreen — tenta re-entrar imediatamente (funciona quando há gesto)
      entrarFullscreen()

      // Aguarda 1.5s para ver se re-entrou (ex: transição de rota) antes de mostrar o guard
      if (guardTimerRef.current) clearTimeout(guardTimerRef.current)
      guardTimerRef.current = setTimeout(() => {
        if (!estaEmFullscreen()) setEmFullscreen(false)
      }, 1500)
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

    // Se o browser não suporta Fullscreen API (iOS Safari, maioria dos mobiles)
    // ou se é um dispositivo touch — não exige fullscreen, libera direto
    const suportaFullscreen = !!(
      document.documentElement.requestFullscreen ||
      (document.documentElement as any).webkitRequestFullscreen ||
      (document.documentElement as any).mozRequestFullScreen
    )
    const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)

    if (!suportaFullscreen || isMobile) {
      setEmFullscreen(true)
      return
    }

    // Desktop com suporte: verificação inicial
    if (!estaEmFullscreen()) {
      guardTimerRef.current = setTimeout(() => {
        if (!estaEmFullscreen()) setEmFullscreen(false)
      }, 800)
    }

    return () => {
      document.removeEventListener('fullscreenchange', verificar)
      document.removeEventListener('webkitfullscreenchange', verificar)
      document.removeEventListener('keydown', bloquearTeclas, true)
      if (guardTimerRef.current) clearTimeout(guardTimerRef.current)
    }
  }, [entrarFullscreen])

  return { emFullscreen, entrarFullscreen }
}
