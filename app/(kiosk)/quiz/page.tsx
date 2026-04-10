'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useSessionStore } from '@/store/sessionStore'
import { InactivityReset } from '@/components/kiosk/InactivityReset'
import { AnimatedBackground } from '@/components/kiosk/AnimatedBackground'
import { QuizCard } from '@/components/kiosk/QuizCard'
import type { Pergunta } from '@/types'

const MAX_PERGUNTAS = 8

export default function QuizPage() {
  const router = useRouter()
  const { sessaoId, setQuizCompleto } = useSessionStore()
  const [perguntas, setPerguntas] = useState<Pergunta[]>([])
  const [indicePergunta, setIndicePergunta] = useState(0)
  const [acertos, setAcertos] = useState(0)
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  const carregarPerguntas = useCallback(() => {
    setLoading(true)
    setErro(null)
    fetch(`/api/perguntas?t=${Date.now()}`, { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) throw new Error(data.error)
        if (!Array.isArray(data)) throw new Error('Resposta inválida')
        setPerguntas(data.slice(0, MAX_PERGUNTAS))
      })
      .catch(() => setErro('Erro ao carregar perguntas. Tente novamente.'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!sessaoId) { router.replace('/'); return }
    carregarPerguntas()
  }, [sessaoId, router, carregarPerguntas])

  const handleResponder = useCallback(
    async (respostaId: string, correta: boolean) => {
      if (!perguntas[indicePergunta]) return
      const novoAcertos = correta ? acertos + 1 : acertos
      if (correta) setAcertos(novoAcertos)

      await new Promise((resolve) => setTimeout(resolve, 1500))

      if (indicePergunta + 1 >= perguntas.length) {
        setQuizCompleto(novoAcertos, perguntas.length)
        router.push('/roleta')
      } else {
        setIndicePergunta((prev) => prev + 1)
      }
    },
    [perguntas, indicePergunta, acertos, setQuizCompleto, router]
  )

  const pct = perguntas.length > 0 ? Math.round(((indicePergunta) / perguntas.length) * 100) : 0

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary relative overflow-hidden">
        <AnimatedBackground />
        <div className="relative z-10 text-center space-y-6 animate-fade-in">
          <div className="w-20 h-20 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-white text-2xl font-semibold">Preparando o quiz...</p>
          <p className="text-gray-400 text-base">Carregando perguntas</p>
        </div>
      </div>
    )
  }

  if (erro || perguntas.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary relative overflow-hidden">
        <AnimatedBackground />
        <div className="relative z-10 text-center space-y-6 p-8 animate-scale-in">
          <div className="text-6xl">😕</div>
          <p className="text-white text-2xl">{erro ?? 'Nenhuma pergunta disponível.'}</p>
          <div className="flex gap-4 justify-center">
            <button onClick={carregarPerguntas}
              className="bg-primary text-white px-8 py-4 rounded-2xl text-xl font-semibold hover:bg-primary-hover transition-colors">
              Tentar novamente
            </button>
            <button onClick={() => { setQuizCompleto(0, 0); router.push('/roleta') }}
              className="bg-white/10 border border-white/30 text-white px-8 py-4 rounded-2xl text-xl font-semibold hover:bg-white/20 transition-colors">
              Pular para a roleta
            </button>
          </div>
        </div>
      </div>
    )
  }

  const perguntaAtual = perguntas[indicePergunta]

  return (
    <div className="kiosk-scroll">
      <InactivityReset />
      <div className="min-h-screen flex flex-col items-center justify-center px-8 py-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #001f28 0%, #003641 40%, #004d5c 70%, #001f28 100%)' }}>

        <AnimatedBackground />

        {/* Header */}
        <div className="relative z-10 w-full max-w-2xl mb-6 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            {/* Branding */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/40 flex items-center justify-center">
                <span className="text-xl">🧠</span>
              </div>
              <span className="text-white font-black text-xl font-display">Quiz</span>
            </div>

            {/* Placar ao vivo */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 bg-green-500/20 border border-green-500/30 rounded-xl px-3 py-2">
                <span className="text-green-400 text-lg">✓</span>
                <span className="text-2xl font-black text-green-400">{acertos}</span>
              </div>
              <div className="text-gray-600 font-bold">|</div>
              <div className="flex items-center gap-1.5 bg-red-500/20 border border-red-500/30 rounded-xl px-3 py-2">
                <span className="text-red-400 text-lg">✗</span>
                <span className="text-2xl font-black text-red-400">{indicePergunta - acertos}</span>
              </div>
            </div>
          </div>

          {/* Barra de progresso global animada */}
          <div className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700 ease-out"
              style={{
                width: `${pct}%`,
                background: 'linear-gradient(90deg, #00AE9D, #7DB61C)',
                boxShadow: '0 0 8px rgba(0,174,157,0.6)',
              }}
            />
          </div>
          <div className="flex justify-between mt-1.5">
            <span className="text-gray-500 text-xs">{indicePergunta} de {perguntas.length} respondidas</span>
            <span className="text-primary text-xs font-semibold">{pct}%</span>
          </div>
        </div>

        {/* Quiz Card */}
        <div className="relative z-10 w-full max-w-2xl">
          <div
            key={perguntaAtual.id}
            className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-2xl shadow-black/40 animate-scale-in border border-white/20"
          >
            <QuizCard
              pergunta={perguntaAtual}
              numero={indicePergunta + 1}
              total={perguntas.length}
              acertos={acertos}
              onResponder={handleResponder}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
