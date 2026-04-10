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
  percentual_acerto: number
}

export interface Sessao {
  id: string
  acertos: number
  total_perguntas: number
  premio_id: string | null
  created_at: string
  premios?: Premio
}

export interface Configuracao {
  id: number
  sistema_ativo: boolean
  dia_inteiro: boolean
  horario_inicio: string // "HH:MM:SS"
  horario_fim: string    // "HH:MM:SS"
  updated_at: string
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
  sessaoId: string | null
  quizCompleto: boolean
  premioSorteado: Premio | null
  etapa: 'inicio' | 'quiz' | 'roleta' | 'fim'
  acertos: number
  totalPerguntas: number
}

export interface ApiError {
  error: string
}
