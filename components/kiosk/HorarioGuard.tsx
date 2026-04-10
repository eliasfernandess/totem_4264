'use client'

import { useEffect, useState } from 'react'
import type { Configuracao } from '@/types'

function dentroDoHorario(config: Configuracao): boolean {
  if (!config.sistema_ativo) return false
  if (config.dia_inteiro) return true

  const agora = new Date()
  const hh = agora.getHours().toString().padStart(2, '0')
  const mm = agora.getMinutes().toString().padStart(2, '0')
  const horaAtual = `${hh}:${mm}`

  const inicio = config.horario_inicio.slice(0, 5) // "HH:MM"
  const fim = config.horario_fim.slice(0, 5)

  // Suporta virada de meia-noite (ex: 22:00 até 02:00)
  if (inicio <= fim) {
    return horaAtual >= inicio && horaAtual <= fim
  } else {
    return horaAtual >= inicio || horaAtual <= fim
  }
}

export function HorarioGuard() {
  const [config, setConfig] = useState<Configuracao | null>(null)
  const [liberado, setLiberado] = useState(true) // assume liberado até verificar

  useEffect(() => {
    const verificar = () => {
      fetch('/api/configuracoes', { cache: 'no-store' })
        .then((res) => res.json())
        .then((data: Configuracao) => {
          setConfig(data)
          setLiberado(dentroDoHorario(data))
        })
        .catch(() => setLiberado(true)) // em caso de erro, não bloqueia
    }

    verificar()
    // Verifica a cada 60 segundos
    const intervalo = setInterval(verificar, 60_000)
    return () => clearInterval(intervalo)
  }, [])

  if (liberado || !config) return null

  // Calcula próximo horário de abertura
  const horaAbertura = config.horario_inicio.slice(0, 5)
  const horaEncerramento = config.horario_fim.slice(0, 5)

  return (
    <div className="fixed inset-0 z-[9998] flex flex-col items-center justify-center bg-gradient-to-br from-secondary via-secondary to-[#001f28]">
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
