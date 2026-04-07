# Totem Interativo para Feiras — Material de Apresentação

---

## 1. O que é o projeto?

O **Totem Interativo** é uma aplicação web desenvolvida para rodar em totens touchscreen em feiras e eventos corporativos.

O objetivo é **capturar leads qualificados** de forma gamificada: o visitante preenche seus dados, responde um quiz de conhecimentos e gira uma roleta para ganhar um prêmio. Tudo isso de forma automática, sem intervenção humana.

---

## 2. Fluxo do usuário

```
[Tela Inicial]
      ↓  toque em "Começar"
[Cadastro]  →  Nome, CPF, Telefone + aceite LGPD
      ↓  dados salvos
[Quiz]  →  perguntas de múltipla escolha (banco de dados)
      ↓  todas respondidas
[Roleta]  →  animação + sorteio de prêmio
      ↓
[Prêmio revelado + confete]
      ↓  60 segundos sem interação
[Reset automático → Tela Inicial]
```

---

## 3. Tecnologias utilizadas

### Frontend
| Tecnologia | Função |
|---|---|
| **Next.js 14** | Framework React com App Router, rotas, SSR e API Routes |
| **TypeScript** | Tipagem estática para segurança e manutenção do código |
| **Tailwind CSS** | Estilização rápida e responsiva via classes utilitárias |
| **Zustand** | Gerenciamento de estado global da sessão do usuário |
| **React Hook Form** | Formulários com validação performática |
| **canvas-confetti** | Animação de confete ao revelar o prêmio |

### Backend
| Tecnologia | Função |
|---|---|
| **Next.js API Routes** | Endpoints serverless — sem servidor dedicado |
| **Supabase** | Banco de dados PostgreSQL gerenciado na nuvem |
| **Zod** | Validação de dados nas APIs (schema validation) |
| **Supabase Auth** | Autenticação do painel administrativo |

### Infraestrutura
| Tecnologia | Função |
|---|---|
| **Vercel** | Deploy automático a partir do GitHub — zero configuração |
| **GitHub** | Controle de versão e integração com Vercel |
| **Supabase** | Banco de dados, autenticação e storage na nuvem |

---

## 4. Arquitetura do sistema

```
┌─────────────────────────────────────────────┐
│                  VERCEL                      │
│                                              │
│   ┌──────────────┐    ┌──────────────────┐  │
│   │   Frontend   │    │   API Routes     │  │
│   │  (Next.js)   │───▶│  (Serverless)    │  │
│   │              │    │                  │  │
│   │  • Totem     │    │  • /api/leads    │  │
│   │  • Admin     │    │  • /api/premios  │  │
│   └──────────────┘    │  • /api/admin/*  │  │
│                       └────────┬─────────┘  │
└────────────────────────────────│────────────┘
                                 │
                    ┌────────────▼─────────────┐
                    │         SUPABASE          │
                    │                           │
                    │  PostgreSQL Database      │
                    │  • leads                  │
                    │  • perguntas              │
                    │  • respostas              │
                    │  • premios                │
                    │  • premios_usuario        │
                    │  • respostas_usuario      │
                    │                           │
                    │  Auth (admin login)       │
                    └───────────────────────────┘
```

---

## 5. Banco de dados

O banco foi modelado no **PostgreSQL** (via Supabase) com 6 tabelas:

| Tabela | O que armazena |
|---|---|
| `leads` | Dados dos participantes (nome, CPF, telefone) |
| `perguntas` | Perguntas do quiz com controle de ordem e status |
| `respostas` | Alternativas de cada pergunta (com flag de correta) |
| `respostas_usuario` | Histórico de respostas de cada participante |
| `premios` | Catálogo de prêmios com estoque e status |
| `premios_usuario` | Registro de qual prêmio cada participante ganhou |

### Recurso avançado: Trigger SQL
Quando o estoque de um prêmio chega a **zero**, um trigger do banco desativa o prêmio automaticamente — sem nenhum código adicional na aplicação:

```sql
create or replace function auto_desativar_premio()
returns trigger as $$
begin
  if new.estoque = 0 then
    new.ativo := false;
  end if;
  return new;
end;
$$ language plpgsql;
```

---

## 6. APIs desenvolvidas

### Kiosk (totem público)
| Método | Rota | Descrição |
|---|---|---|
| POST | `/api/leads` | Cadastrar participante |
| GET | `/api/perguntas` | Listar perguntas ativas (ordem aleatória) |
| POST | `/api/respostas-usuario` | Registrar resposta do usuário |
| GET | `/api/premios` | Listar prêmios disponíveis |
| POST | `/api/premios/sortear` | Sortear prêmio e decrementar estoque |

### Admin (protegido por autenticação)
| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/admin/leads` | Listar todos os leads |
| DELETE | `/api/admin/leads/[id]` | Excluir lead |
| GET | `/api/admin/leads/export` | Exportar leads em CSV |
| GET/POST | `/api/admin/perguntas` | Listar e criar perguntas |
| PUT/DELETE | `/api/admin/perguntas/[id]` | Editar e excluir perguntas |
| GET/POST | `/api/admin/premios` | Listar e criar prêmios |
| PUT/DELETE | `/api/admin/premios/[id]` | Editar e excluir prêmios |

---

## 7. Painel administrativo

Acessível em `/admin/login` com e-mail e senha cadastrados no Supabase Auth.

### Funcionalidades:
- **Leads** — visualização com CPF mascarado (LGPD), exportação em CSV, exclusão
- **Quiz** — CRUD completo de perguntas e alternativas, ativar/desativar perguntas
- **Prêmios** — CRUD completo com controle de estoque, ativar/desativar prêmios

---

## 8. Segurança e LGPD

| Medida | Implementação |
|---|---|
| **Consentimento explícito** | Checkbox obrigatório antes de salvar qualquer dado |
| **CPF mascarado** | Exibido como `***.XXX.XXX-**` no painel admin |
| **Autenticação admin** | Supabase Auth com JWT — sem senha salva no código |
| **Service Role Key** | Chave secreta usada apenas no servidor, nunca exposta ao browser |
| **Validação dupla** | Zod valida dados no frontend (React Hook Form) e no backend (API Routes) |
| **Variáveis de ambiente** | Credenciais armazenadas em `.env.local` e no painel da Vercel |

---

## 9. Recursos técnicos de destaque

### Reset por inatividade
Se o usuário ficar **60 segundos sem interagir** com o totem em qualquer etapa, a aplicação volta automaticamente para a tela inicial. Implementado com eventos de toque/mouse via hook customizado:

```
touchstart / mousemove / keydown / click
→ reinicia contador de 60s
→ ao expirar: limpa sessão e redireciona para /
```

### Roleta dinâmica com Canvas
A roleta é **renderizada em tempo real** via Canvas HTML5 — as fatias são geradas automaticamente com base nos prêmios ativos no banco. Não há imagens estáticas.

### Sorteio com consistência
O sorteio acontece **no servidor** (não no browser), garantindo que:
1. O prêmio sorteado é registrado no banco antes de ser revelado
2. O estoque é decrementado atomicamente
3. Prêmios com estoque zero são excluídos automaticamente do sorteio

### Estado persistente
O estado da sessão do usuário (leadId, etapa atual, prêmio ganho) é armazenado em **Zustand + sessionStorage**, garantindo que um refresh acidental não perca o progresso.

---

## 10. Deploy e entrega

| Etapa | Ferramenta | Detalhe |
|---|---|---|
| Código | GitHub | Repositório `eliasfernandess/totem_4264` |
| Deploy automático | Vercel | Toda vez que há push no `main`, faz deploy automaticamente |
| Banco de dados | Supabase | PostgreSQL gerenciado, sem configuração de servidor |
| URL de produção | Vercel | `https://totem-4264.vercel.app` |
| Painel admin | Vercel | `https://totem-4264.vercel.app/admin` |

---

## 11. Estrutura de arquivos (resumo)

```
/
├── app/
│   ├── (kiosk)/          # Telas do totem (público)
│   │   ├── page.tsx        # Tela inicial
│   │   ├── credenciamento/ # Formulário de cadastro
│   │   ├── quiz/           # Quiz dinâmico
│   │   └── roleta/         # Sorteio de prêmios
│   ├── admin/            # Painel administrativo
│   │   ├── login/
│   │   ├── leads/
│   │   ├── quiz/
│   │   └── premios/
│   └── api/              # Endpoints do backend
├── components/
│   ├── kiosk/            # Roleta, QuizCard, LeadForm
│   ├── admin/            # Navegação do admin
│   └── ui/               # Button, Input, Modal (reutilizáveis)
├── lib/
│   ├── supabase/         # Clientes browser e servidor
│   ├── validations/      # Schemas Zod
│   └── utils/            # CPF, máscaras, CSV
├── hooks/                # useInactivityReset, useRoleta, useSession
├── store/                # sessionStore (Zustand)
├── types/                # Tipos TypeScript globais
└── supabase/migrations/  # SQL do banco de dados
```

---

## 12. Números do projeto

| Item | Quantidade |
|---|---|
| Arquivos criados | ~50 |
| Endpoints de API | 13 |
| Tabelas no banco | 6 |
| Componentes React | 10 |
| Hooks customizados | 3 |
| Linhas de código (aprox.) | ~2.500 |

---

*Desenvolvido com Next.js 14 + Supabase + Vercel — pronto para uso em eventos.*
