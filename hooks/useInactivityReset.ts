import { useEffect, useRef } from 'react'
import { useSessionStore } from '@/store/sessionStore'

export function useInactivityReset(timeoutMs = 60_000) {
  const timer = useRef<ReturnType<typeof setTimeout>>()
  const reset = useSessionStore((s) => s.resetSession)

  useEffect(() => {
    const restart = () => {
      clearTimeout(timer.current)
      timer.current = setTimeout(reset, timeoutMs)
    }
    const events = ['touchstart', 'mousemove', 'keydown', 'click']
    events.forEach((e) => window.addEventListener(e, restart))
    restart()
    return () => {
      clearTimeout(timer.current)
      events.forEach((e) => window.removeEventListener(e, restart))
    }
  }, [reset, timeoutMs])
}
