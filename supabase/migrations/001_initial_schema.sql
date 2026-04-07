-- migrations/001_initial_schema.sql

-- Habilita extensão UUID
create extension if not exists "pgcrypto";

-- Leads capturados
create table leads (
  id            uuid primary key default gen_random_uuid(),
  nome          text not null,
  cpf           text not null unique,
  telefone      text not null,
  aceita_marketing boolean not null default false,
  created_at    timestamptz not null default now()
);

-- Perguntas do quiz
create table perguntas (
  id       uuid primary key default gen_random_uuid(),
  pergunta text not null,
  ativa    boolean not null default true,
  ordem    int
);

-- Respostas de cada pergunta
create table respostas (
  id          uuid primary key default gen_random_uuid(),
  pergunta_id uuid not null references perguntas(id) on delete cascade,
  texto       text not null,
  correta     boolean not null default false
);

-- Respostas dos usuários no quiz
create table respostas_usuario (
  id          uuid primary key default gen_random_uuid(),
  lead_id     uuid not null references leads(id) on delete cascade,
  pergunta_id uuid not null references perguntas(id),
  resposta_id uuid not null references respostas(id),
  created_at  timestamptz not null default now()
);

-- Catálogo de prêmios
create table premios (
  id        uuid primary key default gen_random_uuid(),
  nome      text not null,
  descricao text,
  estoque   int not null default 0,
  ativo     boolean not null default true,
  check (estoque >= 0)
);

-- Prêmios sorteados por usuário
create table premios_usuario (
  id         uuid primary key default gen_random_uuid(),
  lead_id    uuid not null references leads(id) on delete cascade,
  premio_id  uuid not null references premios(id),
  created_at timestamptz not null default now()
);

-- Trigger: desativa prêmio quando estoque chegar a 0
create or replace function auto_desativar_premio()
returns trigger as $$
begin
  if new.estoque = 0 then
    new.ativo := false;
  end if;
  return new;
end;
$$ language plpgsql;

create trigger trg_desativar_premio
before update on premios
for each row execute function auto_desativar_premio();
