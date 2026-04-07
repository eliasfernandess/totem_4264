'use client'

import { useRouter } from 'next/navigation'
import { InactivityReset } from '@/components/kiosk/InactivityReset'
import { LeadForm } from '@/components/kiosk/LeadForm'
import { Button } from '@/components/ui/Button'

export default function CredenciamentoPage() {
  const router = useRouter()

  return (
    <div className="kiosk-scroll">
      <InactivityReset />
      <div className="min-h-screen flex flex-col items-center justify-center px-8 py-16 bg-gradient-to-br from-secondary via-secondary to-[#001f28]">
        <div className="w-full max-w-lg">
          {/* Cabeçalho */}
          <div className="text-center mb-10 animate-fade-in">
            <div className="w-20 h-20 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <h1 className="text-4xl font-black text-white mb-3 font-display">
              Cadastre-se
            </h1>
            <p className="text-gray-300 text-lg">
              Preencha seus dados para participar
            </p>
          </div>

          {/* Formulário */}
          <div className="bg-white rounded-3xl p-8 shadow-2xl animate-slide-up">
            <LeadForm />
          </div>

          {/* Voltar */}
          <div className="mt-6 text-center animate-fade-in">
            <Button
              variant="ghost"
              onClick={() => router.push('/')}
              className="text-gray-400 hover:text-white"
            >
              ← Voltar
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
