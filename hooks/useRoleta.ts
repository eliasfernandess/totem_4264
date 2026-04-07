import { useState, useRef, useCallback } from 'react'
import type { Premio } from '@/types'

interface UseRoletaOptions {
  premios: Premio[]
  onSorteio?: (premio: Premio) => void
}

export function useRoleta({ premios, onSorteio }: UseRoletaOptions) {
  const [girando, setGirando] = useState(false)
  const [anguloAtual, setAnguloAtual] = useState(0)
  const [premioSorteado, setPremioSorteado] = useState<Premio | null>(null)
  const animRef = useRef<ReturnType<typeof setTimeout>>()

  const girar = useCallback(
    async (premioForcado?: Premio) => {
      if (girando || premios.length === 0) return

      const premio = premioForcado ?? premios[Math.floor(Math.random() * premios.length)]
      const indicePremio = premios.findIndex((p) => p.id === premio.id)
      const fatia = 360 / premios.length
      const anguloAlvo = 360 - (indicePremio * fatia + fatia / 2)
      const voltasExtras = 1440 // 4 voltas completas
      const anguloFinal = voltasExtras + anguloAlvo

      setGirando(true)
      setPremioSorteado(null)
      setAnguloAtual((prev) => prev + anguloFinal)

      animRef.current = setTimeout(() => {
        setGirando(false)
        setPremioSorteado(premio)
        onSorteio?.(premio)
      }, 4000)
    },
    [girando, premios, onSorteio]
  )

  return { girando, anguloAtual, premioSorteado, girar }
}
