'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSessionStore } from '@/store/sessionStore'
import { InactivityReset } from '@/components/kiosk/InactivityReset'
import type { Configuracao } from '@/types'

function gerarUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

function dentroDoHorario(config: Configuracao): boolean {
  if (!config.sistema_ativo) return false
  if (config.dia_inteiro) return true

  const agora = new Date()
  const hh = agora.getHours().toString().padStart(2, '0')
  const mm = agora.getMinutes().toString().padStart(2, '0')
  const horaAtual = `${hh}:${mm}`

  const inicio = config.horario_inicio.slice(0, 5)
  const fim = config.horario_fim.slice(0, 5)

  // Suporta virada de meia-noite (ex: 22:00 até 02:00)
  if (inicio <= fim) {
    return horaAtual >= inicio && horaAtual <= fim
  } else {
    return horaAtual >= inicio || horaAtual <= fim
  }
}

export default function TelaInicial() {
  const router = useRouter()
  const { etapa, sessaoId, iniciarSessao, resetSession } = useSessionStore()
  const [config, setConfig] = useState<Configuracao | null>(null)
  const [verificado, setVerificado] = useState(false)

  // Verifica configuração de horário
  useEffect(() => {
    const verificar = () => {
      fetch(`/api/configuracoes?t=${Date.now()}`, { cache: 'no-store' })
        .then((res) => res.json())
        .then((data: Configuracao) => {
          setConfig(data)
          setVerificado(true)
        })
        .catch(() => setVerificado(true)) // em erro, não bloqueia
    }

    verificar()
    const intervalo = setInterval(verificar, 60_000)
    return () => clearInterval(intervalo)
  }, [])

  // Retoma sessão em andamento (ignora bloqueio de horário — sessão já iniciada)
  useEffect(() => {
    if (!verificado) return
    if (sessaoId && etapa === 'quiz') router.replace('/quiz')
    else if (sessaoId && etapa === 'roleta') router.replace('/roleta')
    else if (etapa === 'fim') resetSession()
  }, [verificado, etapa, sessaoId, router, resetSession])

  const handleJogar = () => {
    const id = gerarUUID()
    iniciarSessao(id)
    router.push('/quiz')
  }

  // Aguarda verificação
  if (!verificado) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // Bloqueio de horário — só na splash, nunca durante uma sessão ativa
  const bloqueado = config && !dentroDoHorario(config)

  if (bloqueado) {
    const horaAbertura = config.horario_inicio.slice(0, 5)
    const horaEncerramento = config.horario_fim.slice(0, 5)

    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-secondary via-secondary to-[#001f28] relative">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-primary/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        </div>

        <div className="relative z-10 text-center px-8 max-w-lg animate-fade-in">
          <div className="text-8xl mb-8">
            {config.sistema_ativo ? '🕐' : '🔒'}
          </div>

          <h1 className="text-5xl font-black text-white mb-4 font-display">
            {config.sistema_ativo ? 'Fora do Horário' : 'Sistema Pausado'}
          </h1>

          {config.sistema_ativo ? (
            <>
              <p className="text-xl text-gray-300 mb-6 leading-relaxed">
                O totem está disponível das
              </p>
              <div className="flex items-center justify-center gap-4 mb-8">
                <div className="bg-white/10 border border-white/20 rounded-2xl px-8 py-4">
                  <div className="text-4xl font-black text-primary">{horaAbertura}</div>
                  <div className="text-gray-400 text-sm">abertura</div>
                </div>
                <div className="text-3xl text-gray-500">→</div>
                <div className="bg-white/10 border border-white/20 rounded-2xl px-8 py-4">
                  <div className="text-4xl font-black text-primary">{horaEncerramento}</div>
                  <div className="text-gray-400 text-sm">encerramento</div>
                </div>
              </div>
              <p className="text-gray-400 text-lg">Volte no horário de funcionamento!</p>
            </>
          ) : (
            <p className="text-xl text-gray-300 mt-4">
              O sistema está temporariamente desativado.<br />
              Aguarde a liberação pelo administrador.
            </p>
          )}
        </div>
      </div>
    )
  }

  // Tela normal de entrada
  return (
    <div className="kiosk-scroll">
      <InactivityReset />
      <div className="min-h-screen flex flex-col items-center justify-center px-8 py-16 bg-gradient-to-br from-secondary via-secondary to-[#001f28] relative">

        {/* Decoração */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-accent/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        </div>

        {/* Logo */}
        <div className="mb-12 animate-fade-in relative z-10">
          <div className="w-32 h-32 rounded-full bg-primary flex items-center justify-center shadow-2xl shadow-primary/40">
            <svg className="w-16 h-16 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
              />
            </svg>
          </div>
        </div>

        {/* Título */}
        <div className="text-center mb-12 animate-slide-up relative z-10">
          <h1 className="text-6xl font-black text-white mb-4 font-display leading-tight">
            Bem-vindo ao<br />
            <span className="text-primary">Totem Interativo</span>
          </h1>
          <p className="text-2xl text-gray-300 max-w-lg mx-auto leading-relaxed">
            Responda o quiz, gire a roleta e ganhe prêmios!
          </p>
        </div>

        {/* Passos */}
        <div className="flex gap-8 mb-16 animate-slide-up relative z-10">
          {[
            { num: '1', label: 'Responda o Quiz', icon: '🧠' },
            { num: '2', label: 'Gire a Roleta', icon: '🎡' },
            { num: '3', label: 'Ganhe Prêmios!', icon: '🏆' },
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
        <div className="animate-slide-up relative z-10">
          <button
            onClick={handleJogar}
            className="bg-primary hover:bg-primary-hover text-white text-2xl font-black px-20 py-6 rounded-2xl shadow-2xl shadow-primary/40 transition-all active:scale-95"
          >
            Toque para Jogar!
          </button>
        </div>
      </div>
    </div>
  )
}
