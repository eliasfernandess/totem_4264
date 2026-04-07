'use client'

import { useEffect, useState } from 'react'
import { AdminNav } from '@/components/admin/AdminNav'
import { Modal } from '@/components/ui/Modal'
import type { Premio } from '@/types'

interface PremioForm {
  nome: string
  descricao: string
  estoque: string
  ativo: boolean
}

const formVazio: PremioForm = { nome: '', descricao: '', estoque: '0', ativo: true }

export default function AdminPremiosPage() {
  const [premios, setPremios] = useState<Premio[]>([])
  const [loading, setLoading] = useState(true)
  const [modalAberto, setModalAberto] = useState(false)
  const [editando, setEditando] = useState<string | null>(null)
  const [form, setForm] = useState<PremioForm>(formVazio)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  const carregar = async () => {
    setLoading(true)
    const res = await fetch('/api/admin/premios')
    const data = await res.json()
    if (!data.error) setPremios(data)
    setLoading(false)
  }

  useEffect(() => { carregar() }, [])

  const abrirCriar = () => {
    setEditando(null)
    setForm(formVazio)
    setErro(null)
    setModalAberto(true)
  }

  const abrirEditar = (p: Premio) => {
    setEditando(p.id)
    setForm({ nome: p.nome, descricao: p.descricao ?? '', estoque: p.estoque.toString(), ativo: p.ativo })
    setErro(null)
    setModalAberto(true)
  }

  const handleSalvar = async () => {
    setErro(null)
    setSalvando(true)

    const payload = {
      nome: form.nome,
      descricao: form.descricao || null,
      estoque: parseInt(form.estoque) || 0,
      ativo: form.ativo,
    }

    const url = editando ? `/api/admin/premios/${editando}` : '/api/admin/premios'
    const method = editando ? 'PUT' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    const data = await res.json()
    setSalvando(false)

    if (data.error) {
      setErro(data.error)
      return
    }

    setModalAberto(false)
    carregar()
  }

  const setField = (campo: keyof PremioForm, valor: string | boolean) => {
    setForm((prev) => ({ ...prev, [campo]: valor }))
  }

  return (
    <div>
      <AdminNav />
      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Gerenciar Prêmios</h1>
          <button
            onClick={abrirCriar}
            className="bg-primary text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-primary-hover transition-colors"
          >
            + Novo Prêmio
          </button>
        </div>

        {loading ? (
          <div className="text-center py-16 text-gray-500">Carregando...</div>
        ) : premios.length === 0 ? (
          <div className="text-center py-16 text-gray-500">Nenhum prêmio cadastrado.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {premios.map((p) => (
              <div key={p.id} className="bg-white rounded-2xl shadow p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-gray-900">{p.nome}</h3>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          p.ativo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                        }`}
                      >
                        {p.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                    {p.descricao && <p className="text-sm text-gray-500 mb-2">{p.descricao}</p>}
                    <div className="flex items-center gap-1 text-sm">
                      <span className="text-gray-500">Estoque:</span>
                      <span
                        className={`font-bold ${p.estoque > 0 ? 'text-green-600' : 'text-red-600'}`}
                      >
                        {p.estoque}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => abrirEditar(p)}
                    className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm font-medium hover:bg-gray-50 transition-colors flex-shrink-0"
                  >
                    Editar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Modal
        open={modalAberto}
        onClose={() => setModalAberto(false)}
        title={editando ? 'Editar Prêmio' : 'Novo Prêmio'}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Nome</label>
            <input
              value={form.nome}
              onChange={(e) => setField('nome', e.target.value)}
              className="w-full border-2 border-gray-200 rounded-xl p-3 outline-none focus:border-primary text-gray-900"
              placeholder="Ex: Camiseta, Brinde exclusivo..."
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Descrição</label>
            <textarea
              value={form.descricao}
              onChange={(e) => setField('descricao', e.target.value)}
              rows={2}
              className="w-full border-2 border-gray-200 rounded-xl p-3 outline-none focus:border-primary resize-none text-gray-900"
              placeholder="Opcional"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Estoque</label>
              <input
                type="number"
                min="0"
                value={form.estoque}
                onChange={(e) => setField('estoque', e.target.value)}
                className="w-full border-2 border-gray-200 rounded-xl p-3 outline-none focus:border-primary text-gray-900"
              />
            </div>
            <div className="flex items-end pb-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.ativo}
                  onChange={(e) => setField('ativo', e.target.checked)}
                  className="w-4 h-4 text-primary rounded"
                />
                <span className="text-sm font-semibold text-gray-700">Ativo</span>
              </label>
            </div>
          </div>

          {erro && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-700 text-sm">
              {erro}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setModalAberto(false)}
              className="flex-1 py-3 rounded-xl border-2 border-gray-200 font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSalvar}
              disabled={salvando}
              className="flex-1 py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary-hover transition-colors disabled:opacity-60"
            >
              {salvando ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
