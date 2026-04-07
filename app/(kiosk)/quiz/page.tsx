'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useSessionStore } from '@/store/sessionStore'
import { InactivityReset } from '@/components/kiosk/InactivityReset'
import { QuizCard } from '@/components/kiosk/QuizCard'
import type { Pergunta } from '@/types'

export default function QuizPage() {
  const router = useRouter()
  const { leadId, setQuizCompleto, resetSession } = useSessionStore()
  const [perguntas, setPerguntas] = useState<Pergunta[]>([])
  const [indicePergunta, setIndicePergunta] = useState(0)
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => {
    if (!leadId) {
      router.replace('/')
      return
    }

    fetch('/api/perguntas')
      .then((res) => res.json())
      .then((data) => {
        if (data.error) throw new Error(data.error)
        setPerguntas(data)
      })
      .catch(() => setErro('Erro ao carregar perguntas. Tente novamente.'))
      .finally(() => setLoading(false))
  }, [leadId, router])

  const handleResponder = useCallback(
    async (respostaId: string) => {
      const perguntaAtual = perguntas[indicePergunta]
      if (!perguntaAtual || !leadId) return

      try {
        await fetch('/api/respostas-usuario', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            lead_id: leadId,
            pergunta_id: perguntaAtual.id,
            resposta_id: respostaId,
          }),
        })
      } catch {
        // Continua mesmo com erro de rede
      }

      await new Promise((resolve) => setTimeout(resolve, 1500))

      if (indicePergunta + 1 >= perguntas.length) {
        setQuizCompleto()
        router.push('/roleta')
      } else {
        setIndicePergunta((prev) => prev + 1)
      }
    },
    [perguntas, indicePergunta, leadId, setQuizCompleto, router]
  )

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-white text-xl">Carregando perguntas...</p>
        </div>
      </div>
    )
  }

  if (erro || perguntas.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary">
        <div className="text-center space-y-6 p-8">
          <p className="text-white text-2xl">{erro ?? 'Nenhuma pergunta disponível.'}</p>
          <button
            onClick={() => {
              if (erro) setErro(null)
              else {
                setQuizCompleto()
                router.push('/roleta')
              }
            }}
            className="bg-primary text-white px-8 py-4 rounded-2xl text-xl font-semibold"
          >
            {erro ? 'Tentar novamente' : 'Ir para a roleta'}
          </button>
        </div>
      </div>
    )
  }

  const perguntaAtual = perguntas[indicePergunta]

  return (
    <div className="kiosk-scroll">
      <InactivityReset />
      <div className="min-h-screen flex flex-col items-center justify-center px-8 py-16 bg-gradient-to-br from-secondary via-secondary to-[#001f28]">
        {/* Header */}
        <div className="text-center mb-10 animate-fade-in">
          <div className="w-16 h-16 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-black text-white font-display">Quiz de Conhecimentos</h1>
        </div>

        {/* Quiz Card */}
        <div className="w-full max-w-2xl bg-white rounded-3xl p-8 shadow-2xl">
          <QuizCard
            key={perguntaAtual.id}
            pergunta={perguntaAtual}
            numero={indicePergunta + 1}
            total={perguntas.length}
            onResponder={handleResponder}
          />
        </div>
      </div>
    </div>
  )
}
