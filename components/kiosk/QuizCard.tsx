'use client'

import { useState } from 'react'
import type { Pergunta, Resposta } from '@/types'
import { clsx } from 'clsx'

interface QuizCardProps {
  pergunta: Pergunta
  numero: number
  total: number
  onResponder: (respostaId: string) => Promise<void>
}

export function QuizCard({ pergunta, numero, total, onResponder }: QuizCardProps) {
  const [selecionada, setSelecionada] = useState<string | null>(null)
  const [respondida, setRespondida] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleResposta = async (resposta: Resposta) => {
    if (respondida || loading) return

    setSelecionada(resposta.id)
    setRespondida(true)
    setLoading(true)

    await onResponder(resposta.id)
    setLoading(false)
  }

  const getEstiloResposta = (resposta: Resposta) => {
    if (!respondida) {
      return 'border-gray-200 hover:border-primary hover:bg-primary/5 active:scale-98'
    }
    if (resposta.correta) return 'border-green-medium bg-green-medium/10 text-green-700'
    if (resposta.id === selecionada) return 'border-red-400 bg-red-50 text-red-700'
    return 'border-gray-200 opacity-50'
  }

  return (
    <div className="w-full max-w-2xl mx-auto animate-slide-up">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-primary font-semibold text-lg">
            Pergunta {numero} de {total}
          </span>
          <div className="flex gap-1">
            {Array.from({ length: total }).map((_, i) => (
              <div
                key={i}
                className={clsx(
                  'h-2 rounded-full transition-all duration-300',
                  i < numero - 1
                    ? 'bg-primary w-6'
                    : i === numero - 1
                    ? 'bg-primary w-8'
                    : 'bg-gray-200 w-6'
                )}
              />
            ))}
          </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 leading-tight font-display">
          {pergunta.pergunta}
        </h2>
      </div>

      <div className="space-y-4">
        {pergunta.respostas.map((resposta, idx) => (
          <button
            key={resposta.id}
            onClick={() => handleResposta(resposta)}
            disabled={respondida}
            className={clsx(
              'w-full min-h-16 px-6 py-4 rounded-2xl border-2 text-left font-semibold text-lg text-gray-800',
              'transition-all duration-300 flex items-center gap-4',
              getEstiloResposta(resposta)
            )}
          >
            <span className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold flex-shrink-0">
              {String.fromCharCode(65 + idx)}
            </span>
            <span className="flex-1">{resposta.texto}</span>
            {respondida && resposta.correta && (
              <svg className="w-6 h-6 text-green-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            )}
            {respondida && !resposta.correta && resposta.id === selecionada && (
              <svg className="w-6 h-6 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
          </button>
        ))}
      </div>

      {respondida && (
        <div className="mt-6 text-center">
          {loading ? (
            <p className="text-gray-500 animate-pulse text-gray-500">Registrando resposta...</p>
          ) : (
            <p className="text-primary font-semibold animate-fade-in">
              {pergunta.respostas.find((r) => r.id === selecionada)?.correta
                ? '✓ Correto! Avançando...'
                : '✗ Ops! A resposta está destacada. Avançando...'}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
