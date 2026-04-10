'use client'

import { useEffect, useState } from 'react'
import { AdminNav } from '@/components/admin/AdminNav'

interface SessaoHistorico {
  id: string
  acertos: number
  total_perguntas: number
  premio_id: string | null
  created_at: string
  premios: { nome: string } | null
}

export default function AdminHistoricoPage() {
  const [sessoes, setSessoes] = useState<SessaoHistorico[]>([])
  const [loading, setLoading] = useState(true)

  const carregar = () => {
    setLoading(true)
    fetch(`/api/admin/historico?t=${Date.now()}`, { cache: 'no-store' })
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setSessoes(data) })
      .finally(() => setLoading(false))
  }

  useEffect(() => { carregar() }, [])

  // Estatísticas
  const hoje = new Date().toDateString()
  const sessoesHoje = sessoes.filter((s) => new Date(s.created_at).toDateString() === hoje)
  const totalPremios = sessoes.filter((s) => s.premio_id).length
  const mediaAcertos = sessoes.length > 0
    ? Math.round(sessoes.filter(s => s.total_perguntas > 0)
        .reduce((acc, s) => acc + (s.acertos / s.total_perguntas) * 100, 0) /
        Math.max(sessoes.filter(s => s.total_perguntas > 0).length, 1))
    : 0

  const formatarData = (iso: string) => {
    const d = new Date(iso)
    return d.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div>
      <AdminNav />
      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Histórico de Partidas</h1>
            <p className="text-sm text-gray-500 mt-1">Sessões anônimas registradas</p>
          </div>
          <button
            onClick={carregar}
            className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50"
          >
            Atualizar
          </button>
        </div>

        {/* Cards de estatísticas */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl shadow p-5 text-center">
            <div className="text-4xl font-black text-primary">{sessoesHoje.length}</div>
            <div className="text-gray-500 text-sm mt-1">partidas hoje</div>
          </div>
          <div className="bg-white rounded-2xl shadow p-5 text-center">
            <div className="text-4xl font-black text-[#7DB61C]">{totalPremios}</div>
            <div className="text-gray-500 text-sm mt-1">prêmios entregues</div>
          </div>
          <div className="bg-white rounded-2xl shadow p-5 text-center">
            <div className="text-4xl font-black text-secondary">{mediaAcertos}%</div>
            <div className="text-gray-500 text-sm mt-1">média de acertos</div>
          </div>
        </div>

        {/* Lista */}
        {loading ? (
          <div className="text-center py-16 text-gray-500">Carregando...</div>
        ) : sessoes.length === 0 ? (
          <div className="text-center py-16 text-gray-400">Nenhuma partida registrada ainda.</div>
        ) : (
          <div className="bg-white rounded-2xl shadow overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Data/Hora</th>
                  <th className="text-center px-4 py-3 font-semibold text-gray-600">Acertos</th>
                  <th className="text-center px-4 py-3 font-semibold text-gray-600">%</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Prêmio</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {sessoes.map((s) => {
                  const pct = s.total_perguntas > 0
                    ? Math.round((s.acertos / s.total_perguntas) * 100)
                    : 0
                  return (
                    <tr key={s.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-600">{formatarData(s.created_at)}</td>
                      <td className="px-4 py-3 text-center font-semibold text-gray-900">
                        {s.acertos}/{s.total_perguntas}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`font-bold ${pct >= 70 ? 'text-green-600' : pct >= 40 ? 'text-yellow-600' : 'text-red-500'}`}>
                          {pct}%
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {s.premios ? (
                          <span className="bg-primary/10 text-primary font-medium px-2 py-0.5 rounded-lg">
                            {s.premios.nome}
                          </span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  )
}
