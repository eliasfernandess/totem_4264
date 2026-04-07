import { mascararCPF } from './cpf'

interface LeadExport {
  id: string
  nome: string
  cpf: string
  telefone: string
  aceita_marketing: boolean
  created_at: string
}

export function gerarCSV(leads: LeadExport[]): string {
  const headers = ['ID', 'Nome', 'CPF', 'Telefone', 'Aceita Marketing', 'Data de Cadastro']
  const rows = leads.map((lead) => [
    lead.id,
    `"${lead.nome.replace(/"/g, '""')}"`,
    mascararCPF(lead.cpf),
    lead.telefone,
    lead.aceita_marketing ? 'Sim' : 'Não',
    new Date(lead.created_at).toLocaleString('pt-BR'),
  ])

  const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n')
  return '\uFEFF' + csvContent // BOM para Excel reconhecer UTF-8
}
