'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useSessionStore } from '@/store/sessionStore'
import { InactivityReset } from '@/components/kiosk/InactivityReset'
import { QuizCard } from '@/components/kiosk/QuizCard'
import type { Pergunta } from '@/types'

const MAX_PERGUNTAS = 8

export default function QuizPage() {
  const router = useRouter()
  const { sessaoId, setQuizCompleto, resetSession } = useSessionStore()
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
    if (!sessaoId) {
      router.replace('/')
      return
    }
    carregarPerguntas()
  }, [sessaoId, router, carregarPerguntas])

  const handleResponder = useCallback(
    async (respostaId: string, correta: boolean) => {
      const perguntaAtual = perguntas[indicePergunta]
      if (!perguntaAtual) return

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-white text-xl">Carregando quiz...</p>
        </div>
      </div>
    )
  }

  if (erro || perguntas.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary">
        <div className="text-center space-y-6 p-8">
          <p className="text-white text-2xl">{erro ?? 'Nenhuma pergunta disponível.'}</p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={carregarPerguntas}
              className="bg-primary text-white px-8 py-4 rounded-2xl text-xl font-semibold"
            >
              Tentar novamente
            </button>
            <button
              onClick={() => {
                setQuizCompleto(0, 0)
                router.push('/roleta')
              }}
              className="bg-white/10 border border-white/30 text-white px-8 py-4 rounded-2xl text-xl font-semibold"
            >
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
      <div className="min-h-screen flex flex-col items-center justify-center px-8 py-16 bg-gradient-to-br from-secondary via-secondary to-[#001f28]">

        {/* Header com placar */}
        <div className="text-center mb-8 animate-fade-in w-full max-w-2xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center">
                <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
              </div>
              <h1 className="text-2xl font-black text-white font-display">Quiz</h1>
            </div>

            {/* Placar ao vivo */}
            {indicePergunta > 0 && (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 bg-green-500/20 border border-green-500/30 rounded-xl px-3 py-1.5">
                  <span className="text-2xl font-black text-green-400">{acertos}</span>
                  <span className="text-green-300 text-xs">acertos</span>
                </div>
                <div className="flex items-center gap-1.5 bg-red-500/20 border border-red-500/30 rounded-xl px-3 py-1.5">
                  <span className="text-2xl font-black text-red-400">{indicePergunta - acertos}</span>
                  <span className="text-red-300 text-xs">erros</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quiz Card */}
        <div className="w-full max-w-2xl bg-white rounded-3xl p-8 shadow-2xl">
          <QuizCard
            key={perguntaAtual.id}
            pergunta={perguntaAtual}
            numero={indicePergunta + 1}
            total={perguntas.length}
            acertos={acertos}
            onResponder={handleResponder}
          />
        </div>
      </div>
    </div>
  )
}
