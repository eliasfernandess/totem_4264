'use client'

import { useEffect, useState } from 'react'
import { AdminNav } from '@/components/admin/AdminNav'
import { Modal } from '@/components/ui/Modal'
import type { Pergunta } from '@/types'

interface PerguntaForm {
  pergunta: string
  ativa: boolean
  ordem: string
  respostas: { texto: string; correta: boolean }[]
}

const formVazio: PerguntaForm = {
  pergunta: '',
  ativa: true,
  ordem: '',
  respostas: [
    { texto: '', correta: true },
    { texto: '', correta: false },
    { texto: '', correta: false },
    { texto: '', correta: false },
  ],
}

export default function AdminQuizPage() {
  const [perguntas, setPerguntas] = useState<Pergunta[]>([])
  const [loading, setLoading] = useState(true)
  const [modalAberto, setModalAberto] = useState(false)
  const [editando, setEditando] = useState<string | null>(null)
  const [form, setForm] = useState<PerguntaForm>(formVazio)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  const carregar = async () => {
    setLoading(true)
    const res = await fetch('/api/admin/perguntas')
    const data = await res.json()
    if (!data.error) setPerguntas(data)
    setLoading(false)
  }

  useEffect(() => { carregar() }, [])

  const abrirCriar = () => {
    setEditando(null)
    setForm(formVazio)
    setErro(null)
    setModalAberto(true)
  }

  const abrirEditar = (p: Pergunta) => {
    setEditando(p.id)
    setForm({
      pergunta: p.pergunta,
      ativa: p.ativa,
      ordem: p.ordem?.toString() ?? '',
      respostas: p.respostas.map((r) => ({ texto: r.texto, correta: r.correta })),
    })
    setErro(null)
    setModalAberto(true)
  }

  const handleSalvar = async () => {
    setErro(null)
    setSalvando(true)

    const payload = {
      pergunta: form.pergunta,
      ativa: form.ativa,
      ordem: form.ordem ? parseInt(form.ordem) : null,
      respostas: form.respostas.filter((r) => r.texto.trim()),
    }

    const url = editando ? `/api/admin/perguntas/${editando}` : '/api/admin/perguntas'
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

  const handleExcluir = async (id: string) => {
    if (!confirm('Excluir esta pergunta?')) return
    await fetch(`/api/admin/perguntas/${id}`, { method: 'DELETE' })
    carregar()
  }

  const setResposta = (idx: number, campo: 'texto' | 'correta', valor: string | boolean) => {
    setForm((prev) => {
      const novas = [...prev.respostas]
      if (campo === 'correta' && valor === true) {
        novas.forEach((r, i) => (r.correta = i === idx))
      } else {
        novas[idx] = { ...novas[idx], [campo]: valor }
      }
      return { ...prev, respostas: novas }
    })
  }

  return (
    <div>
      <AdminNav />
      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Gerenciar Quiz</h1>
          <button
            onClick={abrirCriar}
            className="bg-primary text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-primary-hover transition-colors"
          >
            + Nova Pergunta
          </button>
        </div>

        {loading ? (
          <div className="text-center py-16 text-gray-500">Carregando...</div>
        ) : perguntas.length === 0 ? (
          <div className="text-center py-16 text-gray-500">Nenhuma pergunta cadastrada.</div>
        ) : (
          <div className="space-y-4">
            {perguntas.map((p) => (
              <div key={p.id} className="bg-white rounded-2xl shadow p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          p.ativa ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {p.ativa ? 'Ativa' : 'Inativa'}
                      </span>
                      {p.ordem != null && (
                        <span className="text-xs text-gray-400">Ordem: {p.ordem}</span>
                      )}
                    </div>
                    <p className="font-semibold text-gray-900 mb-3">{p.pergunta}</p>
                    <div className="grid grid-cols-2 gap-2">
                      {p.respostas.map((r) => (
                        <div
                          key={r.id}
                          className={`text-sm px-3 py-1.5 rounded-lg ${
                            r.correta
                              ? 'bg-green-50 text-green-700 border border-green-200'
                              : 'bg-gray-50 text-gray-600'
                          }`}
                        >
                          {r.correta && '✓ '}{r.texto}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    <button
                      onClick={() => abrirEditar(p)}
                      className="px-4 py-1.5 rounded-lg border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Editar
                    </button>
                    <button
                      onClick={async () => {
                        await fetch(`/api/admin/perguntas/${p.id}`, {
                          method: 'PUT',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            pergunta: p.pergunta,
                            ativa: !p.ativa,
                            ordem: p.ordem,
                            respostas: p.respostas.map((r) => ({ texto: r.texto, correta: r.correta })),
                          }),
                        })
                        carregar()
                      }}
                      className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        p.ativa
                          ? 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
                          : 'bg-green-50 text-green-700 hover:bg-green-100'
                      }`}
                    >
                      {p.ativa ? 'Desativar' : 'Ativar'}
                    </button>
                    <button
                      onClick={() => handleExcluir(p.id)}
                      className="px-4 py-1.5 rounded-lg bg-red-50 text-red-600 text-sm font-medium hover:bg-red-100 transition-colors"
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Modal
        open={modalAberto}
        onClose={() => setModalAberto(false)}
        title={editando ? 'Editar Pergunta' : 'Nova Pergunta'}
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Pergunta</label>
            <textarea
              value={form.pergunta}
              onChange={(e) => setForm((prev) => ({ ...prev, pergunta: e.target.value }))}
              rows={3}
              className="w-full border-2 border-gray-200 rounded-xl p-3 outline-none focus:border-primary resize-none text-gray-900"
              placeholder="Digite a pergunta..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Ordem</label>
              <input
                type="number"
                value={form.ordem}
                onChange={(e) => setForm((prev) => ({ ...prev, ordem: e.target.value }))}
                className="w-full border-2 border-gray-200 rounded-xl p-3 outline-none focus:border-primary text-gray-900"
                placeholder="Opcional"
              />
            </div>
            <div className="flex items-end pb-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.ativa}
                  onChange={(e) => setForm((prev) => ({ ...prev, ativa: e.target.checked }))}
                  className="w-4 h-4 text-primary rounded"
                />
                <span className="text-sm font-semibold text-gray-700">Ativa</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Respostas <span className="text-gray-400 font-normal">(marque a correta)</span>
            </label>
            <div className="space-y-2">
              {form.respostas.map((r, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="correta"
                    checked={r.correta}
                    onChange={() => setResposta(idx, 'correta', true)}
                    className="w-4 h-4 text-primary flex-shrink-0"
                  />
                  <input
                    type="text"
                    value={r.texto}
                    onChange={(e) => setResposta(idx, 'texto', e.target.value)}
                    className="flex-1 border-2 border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-primary text-gray-900 text-sm"
                    placeholder={`Resposta ${String.fromCharCode(65 + idx)}`}
                  />
                </div>
              ))}
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
