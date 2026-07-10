# Testes E2E (Playwright)

Testes ponta a ponta que rodam num navegador real (Chromium) contra a
aplicação de verdade — sem mocks. Isso é diferente da suíte Vitest
(`npm test`), que mocka o backend.

## Pré-requisitos

Antes de rodar `npm run test:e2e`, você precisa ter no ar:

1. **PostgreSQL** com o schema migrado (`npx prisma migrate deploy` ou
   `db push`, dentro de `backend/`).
2. **Seed do catálogo já executado**: `npm run seed` (dentro de `backend/`).
   Os testes assumem os 15 carros do catálogo padrão (ids 1–15), incluindo
   Toyota Corolla (id 1), Toyota Corolla Cross, Toyota Hilux e Hyundai HB20
   (o carro mais barato do catálogo).
3. **Ingestão do RAG já executada** (só necessária para o teste do chat,
   que roda seletivamente — ver abaixo): `npm run rag:ingest`, dentro de
   `backend/`.
4. **Backend rodando** na porta 3333: `npm run dev`, dentro de `backend/`.
5. **Frontend rodando** na porta 3000: `npm run dev`, dentro de `frontend/`.

O `playwright.config.ts` **não** sobe os servidores automaticamente
(`webServer`) — isso é intencional, para não mascarar problemas de
configuração de ambiente. Suba backend e frontend manualmente antes de
rodar os testes.

## Rodando os testes

```bash
# suíte padrão (não inclui o teste do chat)
npm run test:e2e

# com interface visual, útil para debugar e ver a execução passo a passo
npm run test:e2e -- --ui

# rodar um arquivo específico
npx playwright test e2e/vitrine.spec.ts

# ver o relatório HTML da última execução
npx playwright show-report
```

## O teste do chat (`e2e/chat.spec.ts`)

Fica de fora da suíte padrão por padrão (`test.skip` condicional): ele faz uma
pergunta real ao assistente, o que dispara uma chamada real de embedding e de
geração à API do Gemini, consumindo cota. Para rodá-lo deliberadamente:

```bash
RUN_CHAT_E2E=1 npx playwright test e2e/chat.spec.ts
```
