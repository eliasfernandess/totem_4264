'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useSessionStore } from '@/store/sessionStore'
import { InactivityReset } from '@/components/kiosk/InactivityReset'
import { Roleta } from '@/components/kiosk/Roleta'
import { useRoleta } from '@/hooks/useRoleta'
import type { Premio } from '@/types'

export default function RoletaPage() {
  const router = useRouter()
  const { leadId, setPremioSorteado, quizCompleto, acertos, totalPerguntas, nome } = useSessionStore()
  const [premios, setPremios] = useState<Premio[]>([])
  const [loading, setLoading] = useState(true)

  const percentualAcerto = totalPerguntas > 0
    ? Math.round((acertos / totalPerguntas) * 100)
    : 0

  useEffect(() => {
    if (!leadId || !quizCompleto) {
      router.replace('/')
      return
    }

    fetch(`/api/premios?acertos=${acertos}&total=${totalPerguntas}`)
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) setPremios(data)
      })
      .finally(() => setLoading(false))
  }, [leadId, quizCompleto, acertos, totalPerguntas, router])

  // Chamado apenas após a animação terminar — sem chamada API aqui
  const handleSorteio = useCallback(
    (premio: Premio) => {
      setPremioSorteado(premio)

      if (typeof window !== 'undefined') {
        import('canvas-confetti').then(({ default: confetti }) => {
          confetti({ particleCount: 250, spread: 90, origin: { y: 0.5 }, colors: ['#00AE9D', '#003641', '#7DB61C', '#C9D200', '#49479D'] })
          setTimeout(() => {
            confetti({ particleCount: 120, angle: 60, spread: 60, origin: { x: 0 } })
            confetti({ particleCount: 120, angle: 120, spread: 60, origin: { x: 1 } })
          }, 400)
          setTimeout(() => {
            confetti({ particleCount: 80, spread: 120, origin: { y: 0.3 } })
          }, 800)
        })
      }
    },
    [setPremioSorteado]
  )

  const { girando, anguloAtual, premioSorteado, girar } = useRoleta({
    premios,
    onSorteio: handleSorteio,
  })

  // Único ponto de chamada da API sortear
  const handleGirar = useCallback(async () => {
    if (!leadId || premios.length === 0 || girando) return

    try {
      const res = await fetch('/api/premios/sortear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lead_id: leadId,
          acertos,
          total_perguntas: totalPerguntas,
        }),
      })
      const data = await res.json()
      if (data.premio) {
        girar(data.premio)
        return
      }
    } catch {
      // fallback para sorteio local
    }
    girar()
  }, [leadId, premios, girando, acertos, totalPerguntas, girar])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // Tela de vitória — aparece após o prêmio ser sorteado
  if (premioSorteado) {
    return (
      <div className="kiosk-scroll">
        <InactivityReset />
        <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-gradient-to-br from-[#001a22] via-secondary to-[#003641]">
          {/* Elementos decorativos de fundo */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-[-10%] left-[-10%] w-96 h-96 rounded-full bg-primary/10 blur-3xl" />
            <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 rounded-full bg-[#7DB61C]/10 blur-3xl" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl" />
          </div>

          <div className="relative z-10 flex flex-col items-center px-8 py-12 text-center max-w-2xl mx-auto">
            {/* Troféu animado */}
            <div className="relative mb-6 animate-bounce-slow">
              <div className="text-[100px] leading-none filter drop-shadow-2xl">🏆</div>
              <div className="absolute -top-2 -right-2 text-4xl animate-spin-slow">⭐</div>
              <div className="absolute -bottom-2 -left-2 text-3xl animate-spin-slow" style={{ animationDirection: 'reverse' }}>✨</div>
            </div>

            {/* Parabéns */}
            <h1 className="text-6xl font-black text-white font-display mb-2 animate-fade-in"
              style={{ textShadow: '0 0 40px rgba(0,174,157,0.6)' }}>
              PARABÉNS!
            </h1>
            {nome && (
              <p className="text-2xl text-primary font-bold mb-6 animate-fade-in">{nome}!</p>
            )}

            {/* Resultado do quiz */}
            <div className="flex items-center gap-4 mb-8 animate-slide-up">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-3 border border-white/20">
                <div className="text-4xl font-black text-primary">{acertos}</div>
                <div className="text-gray-400 text-sm">de {totalPerguntas} acertos</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-3 border border-white/20">
                <div className="text-4xl font-black text-[#7DB61C]">{percentualAcerto}%</div>
                <div className="text-gray-400 text-sm">de aproveitamento</div>
              </div>
            </div>

            {/* Prêmio ganho */}
            <div className="w-full bg-gradient-to-r from-primary/30 to-[#7DB61C]/20 rounded-3xl p-6 border-2 border-primary/50 mb-6 animate-slide-up shadow-2xl shadow-primary/20">
              <p className="text-gray-300 text-lg mb-2">Você ganhou:</p>
              <p className="text-5xl font-black text-white font-display mb-2"
                style={{ textShadow: '0 2px 20px rgba(0,174,157,0.8)' }}>
                {premioSorteado.nome}
              </p>
              {premioSorteado.descricao && (
                <p className="text-gray-300 text-lg">{premioSorteado.descricao}</p>
              )}
            </div>

            {/* Chamada para foto */}
            <div className="w-full bg-yellow-400/20 border-2 border-yellow-400/60 rounded-2xl px-6 py-4 mb-8 animate-pulse-subtle">
              <div className="flex items-center justify-center gap-3">
                <span className="text-3xl">📸</span>
                <div>
                  <p className="text-yellow-300 font-black text-xl">TIRE UMA FOTO DESTA TELA!</p>
                  <p className="text-yellow-200/80 text-sm">Apresente ao atendente para retirar seu prêmio</p>
                </div>
              </div>
            </div>

            {/* Botão de reinício */}
            <button
              onClick={() => router.push('/')}
              className="px-10 py-4 rounded-2xl border-2 border-white/30 text-white font-semibold text-lg hover:bg-white/10 transition-all"
            >
              Finalizar e jogar novamente
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="kiosk-scroll">
      <InactivityReset />
      <div className="min-h-screen flex flex-col items-center justify-center px-8 py-16 bg-gradient-to-br from-secondary via-secondary to-[#001f28] relative">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-4xl font-black text-white font-display">🎡 Hora da Sorte!</h1>
          <p className="text-gray-300 text-xl mt-2">Toque no botão e gire a roleta!</p>
          <div className="flex items-center justify-center gap-2 mt-3">
            <span className="bg-white/10 rounded-xl px-4 py-2 text-primary font-bold text-lg">
              {acertos} / {totalPerguntas} acertos
            </span>
          </div>
        </div>

        {premios.length === 0 ? (
          <div className="text-center space-y-4">
            <p className="text-white text-xl">Nenhum prêmio disponível para o seu desempenho no momento.</p>
          </div>
        ) : (
          <Roleta
            premios={premios}
            premioSorteado={premioSorteado}
            onGirar={handleGirar}
            girando={girando}
            anguloAtual={anguloAtual}
          />
        )}
      </div>
    </div>
  )
}
