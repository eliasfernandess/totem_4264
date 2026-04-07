'use client'

import { useEffect, useState } from 'react'
import { AdminNav } from '@/components/admin/AdminNav'
import { mascararCPF } from '@/lib/utils/cpf'
import type { Lead } from '@/types'

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [exportando, setExportando] = useState(false)

  const carregar = () => {
    setLoading(true)
    fetch('/api/admin/leads')
      .then((res) => res.json())
      .then((data) => { if (!data.error) setLeads(data) })
      .finally(() => setLoading(false))
  }

  useEffect(() => { carregar() }, [])

  const handleExcluir = async (id: string, nome: string) => {
    if (!confirm(`Excluir o lead "${nome}"? Esta ação é irreversível.`)) return
    setLeads((prev) => prev.filter((l) => l.id !== id))
    try {
      const res = await fetch(`/api/admin/leads/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) {
        alert(`Erro ao excluir: ${data.error ?? res.status}`)
        carregar()
      }
    } catch (e) {
      alert('Erro de conexão ao excluir.')
      carregar()
    }
  }

  const handleExportar = async () => {
    setExportando(true)
    try {
      const res = await fetch('/api/admin/leads/export')
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `leads-${new Date().toISOString().slice(0, 10)}.csv`
      a.click()
      window.URL.revokeObjectURL(url)
    } finally {
      setExportando(false)
    }
  }

  return (
    <div>
      <AdminNav />
      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Leads Cadastrados</h1>
            <p className="text-gray-500">{leads.length} participante(s) no total</p>
          </div>
          <button
            onClick={handleExportar}
            disabled={exportando}
            className="bg-primary text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-primary-hover transition-colors disabled:opacity-60"
          >
            {exportando ? 'Exportando...' : 'Exportar CSV'}
          </button>
        </div>

        {loading ? (
          <div className="text-center py-16 text-gray-500">Carregando...</div>
        ) : leads.length === 0 ? (
          <div className="text-center py-16 text-gray-500">Nenhum lead cadastrado.</div>
        ) : (
          <div className="bg-white rounded-2xl shadow overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  {['Nome', 'CPF', 'Telefone', 'Marketing', 'Data', ''].map((h) => (
                    <th key={h} className="px-5 py-3 text-left font-semibold text-gray-600">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 font-medium text-gray-900">{lead.nome}</td>
                    <td className="px-5 py-3 font-mono text-gray-500">
                      {mascararCPF(lead.cpf)}
                    </td>
                    <td className="px-5 py-3 text-gray-700">{lead.telefone}</td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          lead.aceita_marketing
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {lead.aceita_marketing ? 'Sim' : 'Não'}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-500">
                      {new Date(lead.created_at).toLocaleString('pt-BR')}
                    </td>
                    <td className="px-5 py-3">
                      <button
                        onClick={() => handleExcluir(lead.id, lead.nome)}
                        className="text-red-500 hover:text-red-700 text-sm font-medium transition-colors"
                      >
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  )
}
