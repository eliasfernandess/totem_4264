export interface Lead {
  id: string
  nome: string
  cpf: string
  telefone: string
  aceita_marketing: boolean
  created_at: string
}

export interface Pergunta {
  id: string
  pergunta: string
  ativa: boolean
  ordem: number | null
  respostas: Resposta[]
}

export interface Resposta {
  id: string
  pergunta_id: string
  texto: string
  correta: boolean
}

export interface Premio {
  id: string
  nome: string
  descricao: string | null
  estoque: number
  ativo: boolean
}

export interface RespostaUsuario {
  id: string
  lead_id: string
  pergunta_id: string
  resposta_id: string
  created_at: string
}

export interface PremioUsuario {
  id: string
  lead_id: string
  premio_id: string
  created_at: string
}

export interface SessionState {
  leadId: string | null
  nome: string | null
  quizCompleto: boolean
  premioSorteado: Premio | null
  etapa: 'inicio' | 'credenciamento' | 'quiz' | 'roleta' | 'fim'
}

export interface ApiError {
  error: string
}
