# Totem Interativo para Feiras

Aplicação web fullstack para execução em modo kiosk (totem touchscreen), com captura de leads, quiz dinâmico e roleta de prêmios.

---

## Sumário

- [Tecnologias](#tecnologias)
- [Pré-requisitos](#pré-requisitos)
- [Configuração do Supabase](#configuração-do-supabase)
- [Instalação e execução local](#instalação-e-execução-local)
- [Fluxo do usuário (Totem)](#fluxo-do-usuário-totem)
- [Painel Administrativo](#painel-administrativo)
- [Modo Kiosk (produção)](#modo-kiosk-produção)
- [Deploy na Vercel](#deploy-na-vercel)

---

## Tecnologias

| Camada | Tecnologia |
|---|---|
| Frontend | Next.js 14 + TypeScript |
| Banco de dados | PostgreSQL via Supabase |
| Autenticação admin | Supabase Auth |
| Estado global | Zustand + sessionStorage |
| Validação | Zod + React Hook Form |
| Estilo | Tailwind CSS |
| Deploy | Vercel |

---

## Pré-requisitos

- Node.js 18 ou superior
- Conta gratuita no [Supabase](https://supabase.com)

---

## Configuração do Supabase

### 1. Criar o projeto

1. Acesse [supabase.com](https://supabase.com) e faça login
2. Clique em **New Project**
3. Defina nome, senha do banco e região
4. Aguarde a criação (~2 minutos)

### 2. Executar a migration

1. No menu lateral, clique em **SQL Editor**
2. Cole o conteúdo do arquivo `supabase/migrations/001_initial_schema.sql`
3. Clique em **Run**

Isso criará as tabelas: `leads`, `perguntas`, `respostas`, `respostas_usuario`, `premios` e `premios_usuario`.

### 3. Criar usuário administrador

1. No menu lateral, vá em **Authentication → Users**
2. Clique em **Add user → Create new user**
3. Informe e-mail e senha — esses serão os dados de login do painel admin

### 4. Obter as credenciais

1. Vá em **Settings → API**
2. Copie:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role secret** → `SUPABASE_SERVICE_ROLE_KEY`

---

## Instalação e execução local

```bash
# 1. Clonar o repositório
git clone <url-do-repositorio>
cd totem-feira

# 2. Instalar dependências
npm install

# 3. Configurar variáveis de ambiente
cp .env.example .env.local
```

Edite o `.env.local` com as credenciais obtidas no Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

```bash
# 4. Rodar em desenvolvimento
npm run dev
```

Acesse:
- **Totem:** http://localhost:3000
- **Admin:** http://localhost:3000/admin/login

---

## Fluxo do usuário (Totem)

```
[Tela Inicial]
     │  toque em "Começar"
     ▼
[Credenciamento]  → preenche nome, CPF, telefone e aceita a LGPD
     │
     ▼
[Quiz]  → responde perguntas de múltipla escolha (uma por vez)
     │
     ▼
[Roleta]  → gira e descobre o prêmio sorteado 🎉
     │
     ▼
[Reset automático após 60s de inatividade → Tela Inicial]
```

### Regras

- Cada CPF só pode participar **uma vez**
- O aceite da LGPD é **obrigatório** para prosseguir
- Após **60 segundos sem interação**, o totem volta automaticamente para a tela inicial
- Apenas prêmios com estoque disponível aparecem na roleta

---

## Painel Administrativo

Acesse `/admin/login` com o e-mail e senha criados no Supabase Auth.

### Leads

- Visualize todos os participantes cadastrados
- CPF exibido mascarado (`***.XXX.XXX-**`) por privacidade (LGPD)
- Exporte a lista completa em **CSV** clicando em "Exportar CSV"

### Quiz

- **Criar pergunta:** clique em "+ Nova Pergunta", preencha o enunciado e as alternativas, marque a correta e salve
- **Editar pergunta:** clique em "Editar" na pergunta desejada
- **Excluir pergunta:** clique em "Excluir" (ação irreversível)
- Perguntas podem ser **ativadas/desativadas** sem excluí-las
- O campo **Ordem** define a sequência de exibição (opcional — sem ordem são embaralhadas)

### Prêmios

- **Criar prêmio:** clique em "+ Novo Prêmio", defina nome, descrição e quantidade em estoque
- **Editar/repor estoque:** clique em "Editar" no prêmio e ajuste o campo Estoque
- Prêmios com **estoque zerado** são desativados automaticamente pelo banco de dados
- Prêmios **inativos** não aparecem na roleta

---

## Modo Kiosk (produção)

Para travar o navegador em fullscreen no totem/tablet do evento:

**Windows / Linux (Chrome):**
```bash
chrome --kiosk --disable-infobars --no-first-run https://seu-dominio.vercel.app
```

**Mac (Chrome):**
```bash
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome \
  --kiosk --disable-infobars https://seu-dominio.vercel.app
```

Para sair do modo kiosk: `Alt+F4` (Windows) ou `Ctrl+W` (Mac).

---

## Deploy na Vercel

1. Acesse [vercel.com](https://vercel.com) e importe o repositório
2. Em **Environment Variables**, adicione as mesmas variáveis do `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_APP_URL` → URL do seu projeto na Vercel (ex: `https://totem.vercel.app`)
3. Clique em **Deploy**

Após o deploy, atualize o `NEXT_PUBLIC_APP_URL` com a URL real gerada pela Vercel e faça um novo deploy.

---

## Scripts disponíveis

| Comando | Descrição |
|---|---|
| `npm run dev` | Inicia o servidor de desenvolvimento |
| `npm run build` | Gera o build de produção |
| `npm run start` | Inicia o servidor de produção |
| `npm run lint` | Verifica erros de lint |
| `npm run typecheck` | Verifica erros de TypeScript |
