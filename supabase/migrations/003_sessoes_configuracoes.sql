-- migrations/003_sessoes_configuracoes.sql

-- Configurações globais do sistema (horário de funcionamento)
CREATE TABLE IF NOT EXISTS configuracoes (
  id              int PRIMARY KEY DEFAULT 1,
  sistema_ativo   boolean NOT NULL DEFAULT true,
  dia_inteiro     boolean NOT NULL DEFAULT true,
  horario_inicio  time    NOT NULL DEFAULT '08:00',
  horario_fim     time    NOT NULL DEFAULT '18:00',
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- Garante que exista sempre uma linha de configuração
INSERT INTO configuracoes (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- Sessões anônimas dos jogadores (substitui leads)
CREATE TABLE IF NOT EXISTS sessoes (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  acertos          int         NOT NULL DEFAULT 0,
  total_perguntas  int         NOT NULL DEFAULT 0,
  premio_id        uuid        REFERENCES premios(id),
  created_at       timestamptz NOT NULL DEFAULT now()
);
