'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSessionStore } from '@/store/sessionStore'
import { InactivityReset } from '@/components/kiosk/InactivityReset'
import { Button } from '@/components/ui/Button'

export default function TelaInicial() {
  const router = useRouter()
  const etapa = useSessionStore((s) => s.etapa)
  const leadId = useSessionStore((s) => s.leadId)

  useEffect(() => {
    if (leadId && etapa === 'quiz') router.replace('/quiz')
    else if (leadId && etapa === 'roleta') router.replace('/roleta')
  }, [etapa, leadId, router])

  return (
    <div className="kiosk-scroll">
      <InactivityReset />
      <div className="min-h-screen flex flex-col items-center justify-center px-8 py-16 bg-gradient-to-br from-secondary via-secondary to-[#001f28]">
        {/* Logo / Branding */}
        <div className="mb-12 animate-fade-in">
          <div className="w-32 h-32 rounded-full bg-primary flex items-center justify-center shadow-2xl">
            <svg className="w-16 h-16 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
              />
            </svg>
          </div>
        </div>

        {/* Título */}
        <div className="text-center mb-12 animate-slide-up">
          <h1 className="text-6xl font-black text-white mb-4 font-display leading-tight">
            Bem-vindo ao<br />
            <span className="text-primary">Totem Interativo</span>
          </h1>
          <p className="text-2xl text-gray-300 max-w-lg mx-auto leading-relaxed">
            Participe do quiz, gire a roleta e ganhe prêmios incríveis!
          </p>
        </div>

        {/* Passos */}
        <div className="flex gap-8 mb-16 animate-slide-up">
          {[
            { num: '1', label: 'Cadastre-se', icon: '👤' },
            { num: '2', label: 'Responda o Quiz', icon: '🧠' },
            { num: '3', label: 'Gire e Ganhe!', icon: '🎡' },
          ].map((step) => (
            <div key={step.num} className="flex flex-col items-center gap-3 text-center">
              <div className="w-16 h-16 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center text-2xl">
                {step.icon}
              </div>
              <span className="text-white font-semibold text-lg">{step.label}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="animate-slide-up">
          <Button
            onClick={() => router.push('/credenciamento')}
            size="xl"
            className="px-20 text-2xl shadow-2xl shadow-primary/40"
          >
            Toque para Começar
          </Button>
        </div>

        {/* Decoração */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-accent/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        </div>
      </div>
    </div>
  )
}
