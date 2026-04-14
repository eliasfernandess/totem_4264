'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useSessionStore } from '@/store/sessionStore'
import { InactivityReset } from '@/components/kiosk/InactivityReset'
import { AnimatedBackground } from '@/components/kiosk/AnimatedBackground'
import { QuizCard } from '@/components/kiosk/QuizCard'
import type { Pergunta } from '@/types'

const MAX_PERGUNTAS = 8
const MAX_ERROS = 1 // perde ao errar a 2ª pergunta

export default function QuizPage() {
  const router = useRouter()
  const { sessaoId, setQuizCompleto, resetSession } = useSessionStore()
  const [perguntas, setPerguntas] = useState<Pergunta[]>([])
  const [indicePergunta, setIndicePergunta] = useState(0)
  const [acertos, setAcertos] = useState(0)
  const [erros, setErros] = useState(0)
  const [perdeu, setPerdeu] = useState(false)
  const [loading, setLoading] = useState(true)
  const [erroLoad, setErroLoad] = useState<string | null>(null)

  const carregarPerguntas = useCallback(() => {
    setLoading(true)
    setErroLoad(null)
    fetch(`/api/perguntas?t=${Date.now()}`, { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) throw new Error(data.error)
        if (!Array.isArray(data)) throw new Error('Resposta inválida')
        setPerguntas(data.slice(0, MAX_PERGUNTAS))
      })
      .catch(() => setErroLoad('Erro ao carregar perguntas. Tente novamente.'))
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
      const novosErros  = correta ? erros : erros + 1
      if (correta) setAcertos(novoAcertos)
      else setErros(novosErros)

      await new Promise((resolve) => setTimeout(resolve, 1500))

      if (novosErros >= MAX_ERROS) { setPerdeu(true); return }

      if (indicePergunta + 1 >= perguntas.length) {
        setQuizCompleto(novoAcertos, perguntas.length)
        router.push('/roleta')
      } else {
        setIndicePergunta((prev) => prev + 1)
      }
    },
    [perguntas, indicePergunta, acertos, erros, setQuizCompleto, router]
  )

  const pct = perguntas.length > 0 ? Math.round((indicePergunta / perguntas.length) * 100) : 0
  // Vida restante: começa com 1 coração, some após 1 erro
  const vidaRestante = MAX_ERROS - erros // 1 → 0

  // ── Loading ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary relative overflow-hidden">
        <AnimatedBackground />
        <div className="relative z-10 text-center space-y-6 animate-fade-in">
          <div className="w-24 h-24 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-white text-3xl font-semibold">Preparando o quiz...</p>
        </div>
      </div>
    )
  }

  // ── Erro de carregamento ─────────────────────────────────────────
  if (erroLoad || perguntas.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary relative overflow-hidden">
        <AnimatedBackground />
        <div className="relative z-10 text-center space-y-8 p-8 animate-scale-in">
          <div className="text-8xl">😕</div>
          <p className="text-white text-3xl">{erroLoad ?? 'Nenhuma pergunta disponível.'}</p>
          <button onClick={carregarPerguntas}
            className="bg-primary text-white px-12 py-5 rounded-2xl text-2xl font-semibold hover:bg-primary-hover transition-colors">
            Tentar novamente
          </button>
        </div>
      </div>
    )
  }

  // ── Tela de derrota ──────────────────────────────────────────────
  if (perdeu) {
    return (
      <div className="kiosk-scroll">
        <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden px-8 py-16 gap-10"
          style={{ background: 'linear-gradient(180deg, #1a0010 0%, #3d0020 50%, #1a000e 100%)' }}>
          <AnimatedBackground />
          <div className="relative z-10 flex flex-col items-center text-center max-w-lg w-full gap-8 animate-scale-in">
            <div className="relative">
              <div className="absolute inset-0 rounded-full blur-3xl scale-150 animate-pulse"
                style={{ background: 'rgba(220,38,38,0.25)' }} />
              <div className="text-[110px] leading-none relative z-10 animate-bounce-slow">💔</div>
            </div>
            <div className="space-y-3">
              <h1 className="text-7xl font-black text-white font-display"
                style={{ textShadow: '0 0 40px rgba(239,68,68,0.5)' }}>
                Que Pena!
              </h1>
              <p className="text-2xl text-gray-300">
                Você perdeu sua <span className="text-red-400 font-bold">única vida</span>.
              </p>
            </div>
            <div className="flex items-center gap-6">
              <div className="bg-white/10 rounded-2xl px-8 py-5 border border-white/20 text-center">
                <div className="text-5xl font-black text-primary">{acertos}</div>
                <div className="text-gray-400 text-base mt-1">acertos</div>
              </div>
              <div className="bg-red-500/20 rounded-2xl px-8 py-5 border border-red-500/30 text-center">
                <div className="text-5xl font-black text-red-400">{erros}</div>
                <div className="text-gray-400 text-base mt-1">erros</div>
              </div>
            </div>
            <p className="text-gray-400 text-xl">Não desanime! Tente novamente!</p>
            <button
              onClick={() => resetSession()}
              className="w-full py-6 rounded-2xl text-white text-2xl font-black shadow-xl transition-all active:scale-95"
              style={{ background: 'linear-gradient(135deg, #00AE9D, #008C7E)' }}
            >
              Jogar novamente
            </button>
          </div>
        </div>
      </div>
    )
  }

  const perguntaAtual = perguntas[indicePergunta]

  // ── Tela do quiz ─────────────────────────────────────────────────
  return (
    <div className="kiosk-scroll">
      <InactivityReset />
      <div className="min-h-screen flex flex-col px-6 py-8 relative overflow-hidden"
        style={{ background: 'linear-gradient(180deg, #001f28 0%, #003641 40%, #004d5c 70%, #001f28 100%)' }}>

        <AnimatedBackground />

        {/* Header */}
        <div className="relative z-10 w-full max-w-3xl mx-auto mb-6 flex-shrink-0 animate-fade-in">
          <div className="flex items-center justify-between mb-4">

            {/* Título + progresso */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/20 border border-primary/40 flex items-center justify-center">
                <span className="text-2xl">🧠</span>
              </div>
              <div>
                <span className="text-white font-black text-2xl font-display">Quiz</span>
                <p className="text-gray-400 text-sm">{indicePergunta} / {perguntas.length} respondidas</p>
              </div>
            </div>

            {/* Direita: vida + placar */}
            <div className="flex items-center gap-3">
              {/* Indicador de vida */}
              <div className="flex items-center gap-2 bg-white/10 border border-white/20 rounded-xl px-4 py-2.5">
                <span className="text-sm text-gray-400 font-semibold uppercase tracking-wide">Vida</span>
                <div className="flex gap-1">
                  {vidaRestante > 0 ? (
                    <span className="text-3xl leading-none" title="Você tem 1 vida">❤️</span>
                  ) : (
                    <span className="text-3xl leading-none" title="Última chance!">💔</span>
                  )}
                </div>
              </div>

              {/* Acertos e erros */}
              <div className="flex items-center gap-2 bg-green-500/20 border border-green-500/30 rounded-xl px-3 py-2.5">
                <span className="text-green-400 text-lg">✓</span>
                <span className="text-2xl font-black text-green-400">{acertos}</span>
              </div>
              <div className="flex items-center gap-2 bg-red-500/20 border border-red-500/30 rounded-xl px-3 py-2.5">
                <span className="text-red-400 text-lg">✗</span>
                <span className="text-2xl font-black text-red-400">{erros}</span>
              </div>
            </div>
          </div>

          {/* Barra de progresso */}
          <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-700 ease-out"
              style={{
                width: `${pct}%`,
                background: 'linear-gradient(90deg, #00AE9D, #7DB61C)',
                boxShadow: '0 0 8px rgba(0,174,157,0.5)',
              }} />
          </div>
        </div>

        {/* Quiz Card */}
        <div className="relative z-10 w-full max-w-3xl mx-auto flex-1 flex flex-col justify-center">
          <div key={perguntaAtual.id}
            className="bg-white/95 backdrop-blur-sm rounded-3xl p-10 shadow-2xl shadow-black/30 animate-scale-in">
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
