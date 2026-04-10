'use client'

import { useEffect, useState } from 'react'
import { AdminNav } from '@/components/admin/AdminNav'
import type { Configuracao } from '@/types'

export default function AdminConfiguracoesPage() {
  const [config, setConfig] = useState<Configuracao | null>(null)
  const [loading, setLoading] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [msg, setMsg] = useState<{ tipo: 'ok' | 'erro'; texto: string } | null>(null)

  // Form state
  const [sistemaAtivo, setSistemaAtivo] = useState(true)
  const [diaInteiro, setDiaInteiro] = useState(true)
  const [horaInicio, setHoraInicio] = useState('08:00')
  const [horaFim, setHoraFim] = useState('18:00')

  useEffect(() => {
    fetch('/api/admin/configuracoes')
      .then((r) => r.json())
      .then((data: Configuracao) => {
        setConfig(data)
        setSistemaAtivo(data.sistema_ativo)
        setDiaInteiro(data.dia_inteiro)
        setHoraInicio(data.horario_inicio.slice(0, 5))
        setHoraFim(data.horario_fim.slice(0, 5))
      })
      .finally(() => setLoading(false))
  }, [])

  const salvar = async () => {
    setSalvando(true)
    setMsg(null)
    const res = await fetch('/api/admin/configuracoes', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sistema_ativo: sistemaAtivo,
        dia_inteiro: diaInteiro,
        horario_inicio: horaInicio,
        horario_fim: horaFim,
      }),
    })
    const data = await res.json()
    setSalvando(false)
    if (data.error) setMsg({ tipo: 'erro', texto: data.error })
    else setMsg({ tipo: 'ok', texto: 'Configurações salvas com sucesso!' })
    setTimeout(() => setMsg(null), 3000)
  }

  if (loading) {
    return (
      <div>
        <AdminNav />
        <div className="text-center py-24 text-gray-500">Carregando...</div>
      </div>
    )
  }

  return (
    <div>
      <AdminNav />
      <main className="max-w-2xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Configurações do Sistema</h1>
        <p className="text-gray-500 text-sm mb-8">
          Controle quando o totem está disponível para os visitantes.
        </p>

        <div className="bg-white rounded-2xl shadow p-6 space-y-8">

          {/* Master switch */}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-gray-900 text-lg">Sistema ativo</p>
              <p className="text-gray-500 text-sm mt-0.5">
                Desligar para bloquear o totem imediatamente
              </p>
            </div>
            <button
              onClick={() => setSistemaAtivo(!sistemaAtivo)}
              className={`relative w-14 h-7 rounded-full transition-colors ${sistemaAtivo ? 'bg-primary' : 'bg-gray-300'}`}
            >
              <span className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-all ${sistemaAtivo ? 'left-7' : 'left-0.5'}`} />
            </button>
          </div>

          <hr className="border-gray-100" />

          {/* Dia inteiro */}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-gray-900 text-lg">Funcionar dia inteiro</p>
              <p className="text-gray-500 text-sm mt-0.5">
                Ignora o horário e mantém ativo 24h
              </p>
            </div>
            <button
              onClick={() => setDiaInteiro(!diaInteiro)}
              disabled={!sistemaAtivo}
              className={`relative w-14 h-7 rounded-full transition-colors disabled:opacity-40 ${diaInteiro ? 'bg-primary' : 'bg-gray-300'}`}
            >
              <span className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-all ${diaInteiro ? 'left-7' : 'left-0.5'}`} />
            </button>
          </div>

          {/* Horários */}
          {!diaInteiro && sistemaAtivo && (
            <div className="space-y-4 animate-fade-in">
              <hr className="border-gray-100" />
              <p className="font-semibold text-gray-700">Horário de funcionamento</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Abertura</label>
                  <input
                    type="time"
                    value={horaInicio}
                    onChange={(e) => setHoraInicio(e.target.value)}
                    className="w-full border-2 border-gray-200 rounded-xl p-3 text-2xl font-bold text-gray-900 outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Encerramento</label>
                  <input
                    type="time"
                    value={horaFim}
                    onChange={(e) => setHoraFim(e.target.value)}
                    className="w-full border-2 border-gray-200 rounded-xl p-3 text-2xl font-bold text-gray-900 outline-none focus:border-primary"
                  />
                </div>
              </div>
              <p className="text-xs text-gray-400">
                * Suporta horários que cruzam meia-noite (ex: 22:00 → 02:00)
              </p>
            </div>
          )}

          {/* Preview do estado */}
          <div className={`rounded-xl px-4 py-3 text-sm font-medium ${
            !sistemaAtivo
              ? 'bg-red-50 text-red-700 border border-red-200'
              : diaInteiro
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-blue-50 text-blue-700 border border-blue-200'
          }`}>
            {!sistemaAtivo
              ? '🔒 Totem bloqueado — visitantes verão a tela de sistema pausado'
              : diaInteiro
              ? '✅ Totem disponível 24 horas por dia'
              : `🕐 Totem ativo das ${horaInicio} às ${horaFim}`}
          </div>

          {/* Feedback */}
          {msg && (
            <div className={`rounded-xl px-4 py-3 text-sm font-medium ${
              msg.tipo === 'ok' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
            }`}>
              {msg.texto}
            </div>
          )}

          <button
            onClick={salvar}
            disabled={salvando}
            className="w-full py-3 rounded-xl bg-primary text-white font-bold text-lg hover:bg-primary-hover transition-colors disabled:opacity-60"
          >
            {salvando ? 'Salvando...' : 'Salvar Configurações'}
          </button>
        </div>
      </main>
    </div>
  )
}
