'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSessionStore } from '@/store/sessionStore'
import { InactivityReset } from '@/components/kiosk/InactivityReset'
import { AnimatedBackground } from '@/components/kiosk/AnimatedBackground'
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
  if (inicio <= fim) return horaAtual >= inicio && horaAtual <= fim
  return horaAtual >= inicio || horaAtual <= fim
}

export default function TelaInicial() {
  const router = useRouter()
  const { etapa, sessaoId, iniciarSessao, resetSession } = useSessionStore()
  const [config, setConfig] = useState<Configuracao | null>(null)
  const [verificado, setVerificado] = useState(false)

  useEffect(() => {
    const verificar = () => {
      fetch(`/api/configuracoes?t=${Date.now()}`, { cache: 'no-store' })
        .then((res) => res.json())
        .then((data: Configuracao) => { setConfig(data); setVerificado(true) })
        .catch(() => setVerificado(true))
    }
    verificar()
    const intervalo = setInterval(verificar, 60_000)
    return () => clearInterval(intervalo)
  }, [])

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

  if (!verificado) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary">
        <div className="w-20 h-20 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const bloqueado = config && !dentroDoHorario(config)

  if (bloqueado) {
    const horaAbertura = config.horario_inicio.slice(0, 5)
    const horaEncerramento = config.horario_fim.slice(0, 5)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-secondary via-secondary to-[#001f28] relative overflow-hidden px-8">
        <AnimatedBackground />
        <div className="relative z-10 text-center max-w-lg animate-scale-in space-y-6">
          <div className="text-9xl">{config.sistema_ativo ? '🕐' : '🔒'}</div>
          <h1 className="text-6xl font-black text-white font-display">
            {config.sistema_ativo ? 'Fora do Horário' : 'Sistema Pausado'}
          </h1>
          {config.sistema_ativo ? (
            <>
              <p className="text-2xl text-gray-300">O totem está disponível das</p>
              <div className="flex items-center justify-center gap-6">
                <div className="bg-white/10 border border-white/20 rounded-2xl px-10 py-5">
                  <div className="text-5xl font-black text-primary">{horaAbertura}</div>
                  <div className="text-gray-400 text-base mt-1">abertura</div>
                </div>
                <div className="text-4xl text-gray-500">→</div>
                <div className="bg-white/10 border border-white/20 rounded-2xl px-10 py-5">
                  <div className="text-5xl font-black text-primary">{horaEncerramento}</div>
                  <div className="text-gray-400 text-base mt-1">encerramento</div>
                </div>
              </div>
              <p className="text-gray-400 text-xl">Volte no horário de funcionamento!</p>
            </>
          ) : (
            <p className="text-2xl text-gray-300">
              O sistema está temporariamente desativado.<br />
              Aguarde a liberação pelo administrador.
            </p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="kiosk-scroll">
      <InactivityReset />
      <div
        className="min-h-screen flex flex-col items-center justify-between px-8 py-16 relative overflow-hidden"
        style={{ background: 'linear-gradient(180deg, #001520 0%, #002d38 30%, #003d4a 60%, #001520 100%)' }}
      >
        <AnimatedBackground />

        {/* ── Topo: logo ────────────────────────────── */}
        <div className="relative z-10 flex flex-col items-center animate-scale-in pt-4">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-primary/40 blur-2xl scale-150 animate-pulse" />
            <div className="w-36 h-36 rounded-full flex items-center justify-center shadow-2xl shadow-primary/60 relative z-10"
              style={{ background: 'linear-gradient(135deg, #00AE9D, #008C7E)' }}>
              <svg className="w-18 h-18 text-white" style={{ width: 72, height: 72 }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* ── Centro: título ────────────────────────── */}
        <div className="relative z-10 text-center space-y-4" style={{ animation: 'slideUp 0.5s 0.1s ease-out both' }}>
          <h1 className="text-7xl font-black text-white font-display leading-tight">
            Bem-vindo ao
          </h1>
          <h1 className="text-7xl font-black font-display leading-tight animate-shimmer" style={{ color: '#00AE9D' }}>
            Totem Interativo
          </h1>
          <p className="text-2xl text-gray-300 max-w-lg mx-auto leading-relaxed mt-4">
            Responda o quiz, gire a roleta e ganhe prêmios incríveis!
          </p>
        </div>

        {/* ── Passos ───────────────────────────────── */}
        <div className="relative z-10 w-full max-w-2xl" style={{ animation: 'slideUp 0.5s 0.25s ease-out both' }}>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Responda\no Quiz',  icon: '🧠', color: 'from-primary/30 to-primary/10',          border: 'border-primary/40',          delay: '0s'    },
              { label: 'Gire a\nRoleta',    icon: '🎡', color: 'from-[#7DB61C]/30 to-[#7DB61C]/10',      border: 'border-[#7DB61C]/40',        delay: '0.1s'  },
              { label: 'Ganhe\nPrêmios!',   icon: '🏆', color: 'from-[#49479D]/30 to-[#49479D]/10',      border: 'border-[#49479D]/40',        delay: '0.2s'  },
            ].map((step, i) => (
              <div key={i}
                className={`flex flex-col items-center gap-3 text-center bg-gradient-to-b ${step.color} border ${step.border} rounded-2xl px-4 py-6`}
                style={{ animation: `slideUp 0.5s ${step.delay} ease-out both` }}
              >
                <div className="text-5xl animate-bounce-slow" style={{ animationDelay: `${i * 0.4}s` }}>
                  {step.icon}
                </div>
                <span className="text-white font-semibold text-lg leading-tight whitespace-pre-line">{step.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── CTA ──────────────────────────────────── */}
        <div className="relative z-10 w-full max-w-xl" style={{ animation: 'slideUp 0.5s 0.4s ease-out both' }}>
          <div className="relative">
            <div className="absolute inset-0 rounded-2xl animate-pulse-ring" />
            <button
              onClick={handleJogar}
              className="relative z-10 w-full text-white text-3xl font-black py-8 rounded-2xl shadow-2xl shadow-primary/50 transition-all active:scale-95 animate-gradient"
              style={{ background: 'linear-gradient(135deg, #00AE9D, #008C7E, #00AE9D)' }}
            >
              Toque para Jogar!
            </button>
          </div>
          <p className="text-center text-gray-500 text-base mt-4 animate-pulse">✦ Toque na tela para começar ✦</p>
        </div>
      </div>
    </div>
  )
}
