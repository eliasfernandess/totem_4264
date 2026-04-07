# 🎯 Totem Interativo para Feiras — Guia de Desenvolvimento

> Aplicação web fullstack para execução em modo kiosk (totem touchscreen), com captura de leads, quiz dinâmico e gamificação via roleta de prêmios.

---

## 📐 Visão Geral do Projeto

| Camada | Tecnologia |
|---|---|
| Frontend | Next.js 14 (App Router) + TypeScript |
| Backend | Next.js API Routes (serverless) |
| Banco de Dados | PostgreSQL via Supabase |
| Auth (Admin) | Supabase Auth (email + senha) |
| Deploy | Vercel |
| Modo de execução | Fullscreen / Kiosk Mode |

---

## 🎨 Design System

### Paleta de Cores
```css
:root {
  --color-primary:       #00AE9D;  /* Verde-água principal */
  --color-secondary:     #003641;  /* Azul-escuro */
  --color-green-medium:  #7DB61C;  /* Verde médio */
  --color-green-light:   #C9D200;  /* Verde-limão */
  --color-accent:        #49479D;  /* Roxo-índigo */
  --color-white:         #FFFFFF;
  --color-primary-hover: #008C7E;
}
```

### Princípios de UI/UX
- Layout **fullscreen**, centralizado, **touch-friendly**
- Botões com no mínimo **64px de altura**
- Feedback visual em todos os estados (hover, touch, loading, error)
- Transições suaves: `transition: all 0.3s ease`
- Sem navbar tradicional — navegação interna por estado/contexto
- Fonte sugerida: `Syne` (display) + `DM Sans` (corpo) — via Google Fonts

---

## 🗂️ Estrutura de Pastas

```
/
├── app/                        # Next.js App Router
│   ├── (kiosk)/                # Grupo de rotas do totem
│   │   ├── page.tsx            # Tela inicial (splash / CTA)
│   │   ├── credenciamento/     # Captura de lead
│   │   ├── quiz/               # Quiz dinâmico
│   │   └── roleta/             # Roleta de prêmios
│   ├── admin/                  # Painel administrativo
│   │   ├── login/
│   │   ├── leads/
│   │   ├── quiz/
│   │   └── premios/
│   └── api/                    # API Routes
│       ├── leads/
│       ├── perguntas/
│       ├── premios/
│       └── admin/
├── components/
│   ├── kiosk/                  # Componentes exclusivos do totem
│   │   ├── Roleta.tsx
│   │   ├── QuizCard.tsx
│   │   ├── LeadForm.tsx
│   │   └── InactivityReset.tsx
│   ├── admin/                  # Componentes do painel
│   └── ui/                     # Componentes genéricos (Button, Input, Modal…)
├── lib/
│   ├── supabase/
│   │   ├── client.ts           # Cliente browser
│   │   └── server.ts           # Cliente server-side
│   ├── validations/            # Zod schemas
│   │   ├── lead.ts
│   │   └── quiz.ts
│   └── utils/
│       ├── cpf.ts              # Validação de CPF
│       ├── masks.ts            # Máscaras de input (telefone, CPF)
│       └── csv.ts              # Export de leads
├── hooks/
│   ├── useInactivityReset.ts   # Timeout de inatividade
│   ├── useSession.ts           # Estado da sessão kiosk
│   └── useRoleta.ts            # Lógica da roleta
├── store/
│   └── sessionStore.ts         # Zustand — estado global da sessão
├── types/
│   └── index.ts                # Tipos TypeScript globais
└── supabase/
    └── migrations/             # SQL de migrations
        └── 001_initial_schema.sql
```

---

## 🗄️ Banco de Dados — Schema SQL

```sql
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
```

---

## 🔌 API Routes

### Leads

| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/api/leads` | Cadastrar novo lead |
| `GET` | `/api/admin/leads` | Listar todos os leads (admin) |
| `GET` | `/api/admin/leads/export` | Exportar leads como CSV (admin) |

### Quiz

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/api/perguntas` | Listar perguntas ativas (ordem aleatória) |
| `POST` | `/api/respostas-usuario` | Registrar resposta do usuário |
| `GET` | `/api/admin/perguntas` | CRUD perguntas (admin) |
| `POST` | `/api/admin/perguntas` | Criar pergunta (admin) |
| `PUT` | `/api/admin/perguntas/[id]` | Editar pergunta (admin) |
| `DELETE` | `/api/admin/perguntas/[id]` | Remover pergunta (admin) |

### Prêmios

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/api/premios` | Listar prêmios ativos |
| `POST` | `/api/premios/sortear` | Realizar sorteio para um lead |
| `GET` | `/api/admin/premios` | CRUD prêmios (admin) |
| `POST` | `/api/admin/premios` | Criar prêmio (admin) |
| `PUT` | `/api/admin/premios/[id]` | Editar/repor estoque (admin) |

---

## 🔄 Fluxo do Usuário (Kiosk)

```
[Tela Inicial]
     │  toque em "Começar"
     ▼
[Credenciamento]  ──erro──▶  [Feedback de Validação]
     │  lead salvo
     ▼
[Quiz Dinâmico]   ──1 pergunta por vez, ordem aleatória──
     │  todas respondidas
     ▼
[Roleta de Prêmios]  ──animação──▶  [Prêmio Revelado + Confete]
     │  60s de inatividade em qualquer etapa
     ▼
[Reset automático → Tela Inicial]
```

---

## ⚙️ Regras de Negócio

### Sessão & Inatividade
- Um usuário joga **uma única vez por sessão**
- Após **60 segundos de inatividade**, a aplicação reseta automaticamente para a tela inicial
- Estado da sessão armazenado em **Zustand** (memória) + **sessionStorage** (persistência pós-refresh)

```ts
// hooks/useInactivityReset.ts
import { useEffect, useRef } from 'react'
import { useSessionStore } from '@/store/sessionStore'

export function useInactivityReset(timeoutMs = 60_000) {
  const timer = useRef<ReturnType<typeof setTimeout>>()
  const reset = useSessionStore((s) => s.resetSession)

  useEffect(() => {
    const restart = () => {
      clearTimeout(timer.current)
      timer.current = setTimeout(reset, timeoutMs)
    }
    const events = ['touchstart', 'mousemove', 'keydown', 'click']
    events.forEach((e) => window.addEventListener(e, restart))
    restart()
    return () => {
      clearTimeout(timer.current)
      events.forEach((e) => window.removeEventListener(e, restart))
    }
  }, [reset, timeoutMs])
}
```

### Sorteio da Roleta
- Sortear apenas prêmios com `estoque > 0` e `ativo = true`
- Após sorteio: `estoque -= 1`; se `estoque === 0` → `ativo = false` (via trigger SQL)
- A roleta é **renderizada dinamicamente** com os prêmios ativos disponíveis

### Validações de Lead
- **CPF**: algoritmo dos dois dígitos verificadores
- **Telefone**: máscara `(XX) XXXXX-XXXX`, mínimo 10 dígitos
- **LGPD**: checkbox `aceita_marketing` obrigatório; bloqueio de submissão sem consentimento explícito

---

## 🎡 Componente de Roleta

```tsx
// components/kiosk/Roleta.tsx
// Renderização via Canvas ou SVG animado com CSS custom properties.
// A quantidade de fatias é dinâmica, baseada nos prêmios ativos.

interface Premio {
  id: string
  nome: string
  cor?: string
}

interface RoletaProps {
  premios: Premio[]
  premioSorteado: Premio | null
  onGirar: () => void
  girando: boolean
}
```

**Estratégia de animação:**
- Usar `CSS @keyframes` com `transform: rotate()`
- O ângulo final é calculado com base no índice do prêmio sorteado + múltiplas voltas completas (ex: `1440deg + anguloAlvo`)
- Ao parar: disparar confete via `canvas-confetti`

---

## 🛡️ Segurança & LGPD

- Todas as rotas `/api/admin/*` exigem **token JWT válido** (Supabase Auth)
- Middleware Next.js protege o grupo de rotas `/admin`
- Checkbox de consentimento obrigatório antes de qualquer persistência de dados pessoais
- CPF **não deve ser exibido** em listagens — mascarar como `***.XXX.XXX-**` no admin

```ts
// middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  const { data: { session } } = await supabase.auth.getSession()

  if (req.nextUrl.pathname.startsWith('/admin') && !session) {
    return NextResponse.redirect(new URL('/admin/login', req.url))
  }
  return res
}

export const config = { matcher: ['/admin/:path*', '/api/admin/:path*'] }
```

---

## 📦 Dependências Principais

```json
{
  "dependencies": {
    "next": "^14.2.0",
    "react": "^18.3.0",
    "typescript": "^5.4.0",
    "@supabase/supabase-js": "^2.43.0",
    "@supabase/auth-helpers-nextjs": "^0.10.0",
    "zustand": "^4.5.0",
    "zod": "^3.23.0",
    "react-hook-form": "^7.51.0",
    "@hookform/resolvers": "^3.3.0",
    "canvas-confetti": "^1.9.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.3.0"
  },
  "devDependencies": {
    "tailwindcss": "^3.4.0",
    "prettier": "^3.2.0",
    "eslint": "^8.57.0"
  }
}
```

---

## 🚀 Setup Inicial

```bash
# 1. Criar projeto
npx create-next-app@latest totem-feira \
  --typescript --tailwind --eslint --app --src-dir=false

cd totem-feira

# 2. Instalar dependências
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs \
  zustand zod react-hook-form @hookform/resolvers \
  canvas-confetti clsx tailwind-merge

# 3. Variáveis de ambiente
cp .env.example .env.local
# Preencher: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY

# 4. Executar migrations no Supabase
# Cole o conteúdo de supabase/migrations/001_initial_schema.sql
# no SQL Editor do dashboard Supabase e execute.

# 5. Rodar localmente
npm run dev
```

### `.env.example`
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 🖥️ Modo Kiosk (Produção)

Para rodar em um totem/tablet em eventos, configure o navegador para modo fullscreen:

**Chrome (Linux/Windows):**
```bash
google-chrome --kiosk --disable-infobars --no-first-run \
  --disable-restore-session-state https://seu-dominio.vercel.app
```

**Ou via `manifest.json` (PWA):**
```json
{
  "display": "fullscreen",
  "start_url": "/",
  "theme_color": "#00AE9D",
  "background_color": "#003641"
}
```

---

## ✅ Checklist de Entrega

### Kiosk (Totem)
- [ ] Tela inicial com animação de entrada
- [ ] Formulário de credenciamento com validação de CPF e telefone
- [ ] Checkbox LGPD obrigatório
- [ ] Quiz com perguntas aleatórias do banco
- [ ] Animação da roleta com prêmios dinâmicos
- [ ] Confete ao ganhar prêmio
- [ ] Reset automático por inatividade (60s)
- [ ] Funcionamento offline parcial (dados em cache/sessionStorage)

### Painel Admin
- [ ] Login com Supabase Auth
- [ ] Listagem de leads com CPF mascarado
- [ ] Exportação de leads em CSV
- [ ] CRUD de perguntas e respostas
- [ ] CRUD de prêmios com controle de estoque
- [ ] Proteção de rotas por middleware

### Qualidade
- [ ] TypeScript sem erros (`tsc --noEmit`)
- [ ] Validações com Zod em todas as rotas
- [ ] Tratamento global de erros (try/catch + feedback ao usuário)
- [ ] Loading states em todas as operações assíncronas
- [ ] Responsivo para tablets 10"–15" (orientação landscape/portrait)

---

## 📌 Convenções de Código

- **Commits:** Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`)
- **Branches:** `main` → produção | `develop` → homologação | `feature/*` → features
- **Nomenclatura:** componentes em PascalCase, hooks com prefixo `use`, utilitários em camelCase
- **Arquivos de rota API:** sempre exportar handlers tipados com `NextRequest` / `NextResponse`
- **Erros de API:** retornar sempre `{ error: string }` com status HTTP correto

---

*Gerado para uso com Claude Code — adapte conforme as necessidades específicas do evento.*
