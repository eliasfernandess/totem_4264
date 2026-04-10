-- migrations/004_drop_credenciamento.sql
-- Remove tabelas de credenciamento (CPF/telefone/LGPD)
-- O fluxo agora usa sessões anônimas (tabela sessoes)

-- 1. Dependentes de leads primeiro (foreign keys)
DROP TABLE IF EXISTS premios_usuario CASCADE;
DROP TABLE IF EXISTS respostas_usuario CASCADE;

-- 2. Tabela principal de leads
DROP TABLE IF EXISTS leads CASCADE;
