-- migrations/002_percentual_acerto.sql
-- Adiciona campo de percentual mínimo de acerto para cada prêmio

ALTER TABLE premios
ADD COLUMN IF NOT EXISTS percentual_acerto int NOT NULL DEFAULT 0
CHECK (percentual_acerto >= 0 AND percentual_acerto <= 100);

COMMENT ON COLUMN premios.percentual_acerto IS
  'Percentual mínimo de acertos no quiz para o cliente ser elegível a este prêmio (0-100)';
