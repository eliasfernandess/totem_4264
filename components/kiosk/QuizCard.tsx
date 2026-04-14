'use client'

import { useState } from 'react'
import type { Pergunta, Resposta } from '@/types'
import { clsx } from 'clsx'

interface QuizCardProps {
  pergunta: Pergunta
  numero: number
  total: number
  acertos: number
  onResponder: (respostaId: string, correta: boolean) => Promise<void>
}

export function QuizCard({ pergunta, numero, total, acertos, onResponder }: QuizCardProps) {
  const [selecionada, setSelecionada] = useState<string | null>(null)
  const [respondida, setRespondida] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleResposta = async (resposta: Resposta) => {
    if (respondida || loading) return
    setSelecionada(resposta.id)
    setRespondida(true)
    setLoading(true)
    await onResponder(resposta.id, resposta.correta)
    setLoading(false)
  }

  const getEstiloResposta = (resposta: Resposta) => {
    if (!respondida) return 'border-gray-200 hover:border-primary hover:bg-primary/5 active:scale-[0.98]'
    if (resposta.correta) return 'border-green-400 bg-green-50 text-green-800'
    if (resposta.id === selecionada) return 'border-red-400 bg-red-50 text-red-800'
    return 'border-gray-200 opacity-40'
  }

  const respondeuCerto = respondida && pergunta.respostas.find((r) => r.id === selecionada)?.correta

  return (
    <div className="w-full animate-slide-up">
      {/* Progresso e número */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-primary font-bold text-xl">
          Pergunta {numero} de {total}
        </span>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-green-50 px-3 py-1.5 rounded-full">
            <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-green-700 font-bold text-base">{acertos}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-red-50 px-3 py-1.5 rounded-full">
            <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span className="text-red-600 font-bold text-base">{(numero - 1) - acertos}</span>
          </div>
        </div>
      </div>

      {/* Bolinhas de progresso */}
      <div className="flex gap-1.5 mb-6">
        {Array.from({ length: total }).map((_, i) => (
          <div key={i} className={clsx(
            'h-2.5 rounded-full transition-all duration-300 flex-1',
            i < numero - 1 ? 'bg-primary' : i === numero - 1 ? 'bg-primary' : 'bg-gray-200'
          )} />
        ))}
      </div>

      {/* Pergunta */}
      <h2 className="text-3xl font-bold text-gray-900 leading-snug font-display mb-8">
        {pergunta.pergunta}
      </h2>

      {/* Respostas */}
      <div className="space-y-4">
        {pergunta.respostas.map((resposta, idx) => (
          <button
            key={resposta.id}
            onClick={() => handleResposta(resposta)}
            disabled={respondida}
            className={clsx(
              'w-full min-h-[72px] px-6 py-5 rounded-2xl border-2 text-left font-semibold text-xl text-gray-800',
              'transition-all duration-300 flex items-center gap-4',
              getEstiloResposta(resposta)
            )}
          >
            <span className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black text-lg flex-shrink-0">
              {String.fromCharCode(65 + idx)}
            </span>
            <span className="flex-1 leading-snug">{resposta.texto}</span>
            {respondida && resposta.correta && (
              <svg className="w-7 h-7 text-green-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            )}
            {respondida && !resposta.correta && resposta.id === selecionada && (
              <svg className="w-7 h-7 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
          </button>
        ))}
      </div>

      {/* Feedback */}
      {respondida && (
        <div className="mt-6 text-center">
          {loading ? (
            <p className="text-gray-500 text-lg animate-pulse">Registrando resposta...</p>
          ) : (
            <p className={clsx(
              'font-bold animate-fade-in text-xl',
              respondeuCerto ? 'text-green-600' : 'text-red-500'
            )}>
              {respondeuCerto ? '✓ Correto! Muito bem!' : '✗ Ops! A resposta correta está destacada.'}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
