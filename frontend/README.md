# AutoStore — Frontend

Interface web da **AutoStore**: vitrine de carros com filtros, página de detalhe, assistente de IA (chat com RAG), gestão de leads e um painel administrativo de CRUD do catálogo.

Consome a API do [backend](../backend/README.md) — este projeto não tem lógica de negócio própria nem acesso direto ao banco; tudo passa pelo backend via `fetch`.

> Para rodar o sistema completo (backend + frontend + banco), veja o **[README da raiz do monorepo](../README.md)** — ele tem o roteiro de setup do zero. Este arquivo documenta especificamente a camada de frontend.

---

## Stack

| Camada          | Tecnologia                          |
| --------------- | ------------------------------------ |
| Framework       | Next.js 16 (App Router)              |
| UI              | React 19                             |
| Linguagem       | TypeScript (strict)                  |
| Estilo          | Tailwind CSS v4                      |
| Testes unitários/componente | Vitest + React Testing Library |
| Testes E2E      | Playwright                           |
| Fontes          | `Inter` (corpo) e `Space Grotesk` (títulos), via `next/font/google` |

---

## Pré-requisitos

- **Node.js 20.19 ou superior**
- O **backend rodando** (`http://localhost:3333` por padrão) — a vitrine, o detalhe, o chat, os leads e o admin dependem dele. Sem o backend no ar, cada tela mostra seu estado de erro tratado (não trava, não mostra tela em branco).

---

## Instalação

```bash
npm install
```

## Variáveis de ambiente

Copie `.env.example` para `.env`:

```bash
cp .env.example .env
```

```env
NEXT_PUBLIC_API_URL="http://localhost:3333"
```

`NEXT_PUBLIC_API_URL` é a única variável de ambiente do frontend. O prefixo `NEXT_PUBLIC_` é intencional: essa URL não é um segredo (é a própria URL da API, visível em qualquer requisição de rede do navegador) — é o mecanismo padrão do Next.js para expor uma variável ao código do cliente. Nenhuma chave sensível (como `GEMINI_API_KEY`) existe ou é referenciada em nenhum arquivo do frontend — ela vive exclusivamente no backend.

## Como rodar

```bash
# Desenvolvimento (hot reload)
npm run dev

# Build de produção
npm run build
npm start

# Lint
npm run lint
```

A aplicação sobe em `http://localhost:3000`.

---

## Telas disponíveis

| Rota | Tela | Descrição |
| --- | --- | --- |
| `/` | Vitrine | Grid de carros com busca por texto, filtros (montadora, categoria, motorização, faixa de preço) e ordenação por preço. |
| `/carros/[id]` | Detalhe | Galeria de imagens, ficha técnica completa, cores disponíveis e formulário de lead. |
| `/chat` | Assistente IA | Chat estilo ChatGPT/Claude, com sugestões de pergunta, histórico de conversa e botão de "tenho interesse" quando a resposta aponta claramente para um carro específico. |
| `/leads` | Gestão de leads | Lista os leads capturados (nome, contato, mensagem, carro de interesse vinculado). |
| `/admin/carros` | Administração | CRUD visual do catálogo: listar, criar, editar e remover carros. **Sem autenticação** — ver nota de segurança abaixo. |
| `/admin/carros/novo` | Criar carro | Formulário de cadastro, validado no cliente espelhando as regras do backend. |
| `/admin/carros/[id]/editar` | Editar carro | Mesmo formulário, pré-preenchido, enviando `PATCH`. |

> **Nota de segurança:** a área `/admin/*`, assim como a listagem de leads (`GET /leads` no backend), não possui autenticação — está documentado explicitamente no topo dos arquivos de página correspondentes. É uma decisão de escopo consciente para o contexto do desafio, não um descuido. Ver a seção de segurança no [README raiz](../README.md) para o racional completo.

---

## Testes

### Unitários e de componente (Vitest + Testing Library)

```bash
npm test              # roda uma vez
npm run test:watch    # modo watch
npm run test:coverage # com cobertura
```

Cobrem lógica pura (`formatarPreco`, `inferirMotorizacao`, `formatarTelefone`, `obterCarroSugerido`, `validarCarro`) e comportamento de componentes-chave (`LeadForm`, a vitrine com filtros) — sempre mockando `@/lib/api`, nunca dependendo do backend real.

### End-to-end (Playwright)

```bash
npm run test:e2e       # suíte padrão
npm run test:e2e:ui    # modo interativo (visualizar execução)
```

Roda contra o sistema real (backend + frontend + Postgres no ar) — ver pré-requisitos em [`e2e/README.md`](e2e/README.md). O teste do chat fica de fora da suíte padrão por padrão (consome cota real da API do Gemini a cada execução); veja o motivo e como rodá-lo deliberadamente no mesmo arquivo.

---

## Estrutura de pastas

```
frontend/
├── src/
│   ├── app/                        # rotas (App Router)
│   │   ├── layout.tsx              # header, footer, ThemeProvider
│   │   ├── page.tsx                # vitrine
│   │   ├── carros/[id]/page.tsx    # detalhe
│   │   ├── chat/page.tsx           # assistente IA
│   │   ├── leads/page.tsx          # gestão de leads
│   │   └── admin/carros/           # CRUD visual (listar/criar/editar)
│   ├── components/
│   │   ├── admin/                  # CarroForm, ConfirmDialog
│   │   ├── CarroCard.tsx
│   │   ├── ChatUI.tsx
│   │   ├── Filtros.tsx
│   │   ├── Galeria.tsx
│   │   ├── LeadForm.tsx
│   │   ├── SelectCustom.tsx        # dropdown acessível reutilizado em toda a app
│   │   ├── SiteHeader.tsx          # header responsivo (menu hambúrguer < 768px)
│   │   ├── EstadoErro.tsx          # estado de erro compartilhado
│   │   ├── EstadoVazio.tsx         # estado vazio compartilhado
│   │   └── ThemeProvider.tsx / ThemeToggle.tsx
│   └── lib/
│       ├── api.ts                  # cliente HTTP tipado (fetch + tratamento de erro)
│       ├── types.ts                # tipos compartilhados (Carro, Lead, NovoCarro...)
│       ├── format.ts               # formatarPreco, inferirMotorizacao, resolverImagem
│       ├── telefone.ts             # máscara de telefone
│       ├── validarCarro.ts         # validação do formulário de carro (espelha o backend)
│       └── carroSugerido.ts        # lógica de sugestão de carro no chat
├── e2e/                             # testes Playwright
├── public/imagens/                 # fotos dos 15 carros do catálogo
├── .env / .env.example
├── vitest.config.ts
├── playwright.config.ts
└── next.config.ts
```

---

## Decisões técnicas do frontend

### App Router (não Pages Router)

Todas as rotas usam `src/app/`. Cada tela que busca dados é um **Client Component** (`"use client"`) que faz `fetch` no `useEffect` — não há Server Components buscando dados diretamente do banco, porque o frontend não tem acesso ao Postgres: toda a leitura/escrita passa pela API HTTP do backend, mantendo a separação de camadas.

### Cliente de API centralizado (`src/lib/api.ts`)

Um único módulo (`api.listarCarros`, `api.criarLead`, `api.perguntarAoChat` etc.) concentra todas as chamadas HTTP e o tratamento de erro (classe `ApiError`, com `status` e mensagem já extraída do corpo JSON do backend). Toda tela usa esse cliente — nenhum `fetch` solto espalhado pelo código — o que torna trivial mockar a API inteira em testes (`vi.mock("@/lib/api")`).

### Sistema de tema (dark/light via CSS variables)

Tokens (`--color-base`, `--color-surface`, `--color-surface-2`, `--color-border`, `--color-accent`, `--color-text`, `--color-text-muted`) definidos em `globals.css`, resolvidos por `[data-theme="dark"]`/`[data-theme="light"]` na tag `<html>`. Um `ThemeProvider` (Context API) guarda a preferência em `localStorage` e aplica o atributo. Nenhuma cor é hardcoded nos componentes — sempre `var(--color-*)` — o que garante que os dois temas fiquem consistentes automaticamente conforme a UI cresce.

### Estratégia de filtros (vitrine)

Os filtros (montadora, categoria, motorização) são **derivados dinamicamente** do catálogo já carregado (`Array.from(new Set(carros.map(...)))`), não de uma lista fixa — se um carro novo for cadastrado com uma categoria inédita via admin, o filtro se atualiza sozinho, sem precisar tocar em código. A motorização (Combustão/Híbrido/Elétrico/Diesel) é **inferida** do texto livre do campo `motor` (`inferirMotorizacao`, `src/lib/format.ts`) via correspondência de palavras-chave, já que o schema não tem um campo estruturado para isso. Filtragem, busca textual e ordenação são recalculadas em `useMemo`, client-side, sobre o array já carregado — para 15 carros isso é instantâneo e evita ida e volta ao backend a cada tecla digitada na busca.

### Componentes reutilizáveis extraídos por necessidade real

`SelectCustom` (dropdown acessível com `role="listbox"`/`role="option"`, navegação por teclado) é usado nos filtros da vitrine e no formulário de carro do admin. `EstadoErro`/`EstadoVazio` foram extraídos depois que o mesmo bloco de erro/vazio apareceu, quase idêntico, em quatro telas diferentes (vitrine, leads, admin, editar) — extração motivada por duplicação real observada, não antecipada especulativamente.

### `obterCarroSugerido` (chat → lead)

O botão "Tenho interesse" só aparece quando as fontes recuperadas pelo RAG apontam, com dominância clara (≥60% das fontes relevantes) para um único carro — e é vetado por completo se qualquer fonte relevante for um chunk comparativo/genérico (`carroId: null`). Isso evita sugerir um carro errado em respostas comparativas ou de listagem (ex.: "quais Toyotas vocês têm" não deve oferecer lead de um carro específico).

### Responsividade

Mobile-first com breakpoints padrão do Tailwind (`sm`/`md`/`lg`). O header vira um menu hambúrguer abaixo de `md` (768px), mantendo o toggle de tema sempre visível/acessível. Testado manualmente em 320px/375px/768px/1280px, dark e light.

---

## O que ficou de fora (decisão consciente)

- **Autenticação no admin e na listagem de leads** — fora do escopo do desafio; documentado no código e no README raiz.
- **BM25/busca lexical híbrida** — o desafio marca isso como opcional/bônus; o frontend não precisa de nada especial para isso de qualquer forma (é uma decisão de retrieval no backend).
- **Upload de imagem no admin** — o cadastro de carro aceita caminhos/URLs de imagem como texto, não upload de arquivo; simplificação proporcional ao escopo do desafio (evitar armazenamento de blob/CDN).
