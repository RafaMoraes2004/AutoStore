# AutoStore — Backend & RAG

API da loja de carros online **AutoStore**: catálogo de veículos, captura de leads e um assistente de IA com RAG (Retrieval-Augmented Generation) que responde dúvidas ancorado exclusivamente nos dados do catálogo.

Este repositório contém o **backend** (Node.js + Express + TypeScript) e a camada de **RAG** (Prisma + PostgreSQL/pgvector + Gemini).

---

## Stack

| Camada         | Tecnologia                                    |
| -------------- | --------------------------------------------- |
| Runtime        | Node.js 20.19+                                |
| Servidor HTTP  | Express 5 (TypeScript)                        |
| ORM            | Prisma 5                                      |
| Banco de dados | PostgreSQL + extensão pgvector                |
| Embeddings     | Gemini `gemini-embedding-001` (768 dimensões) |
| Geração (LLM)  | Gemini `gemini-3.1-flash-lite`                |
| Execução TS    | tsx                                           |

---

## Pré-requisitos

- **Node.js 20.19 ou superior** (`node --version`)
- **PostgreSQL** com a extensão **pgvector** disponível
- Uma **chave de API do Gemini** (Google AI Studio)

### Instalando o pgvector (Linux / Ubuntu / Mint)

```bash
# Descubra sua versão do Postgres
psql --version

# Instale o pacote correspondente (troque 16 pela sua versão)
sudo apt update
sudo apt install postgresql-16-pgvector
```

Se preferir Docker, a imagem `pgvector/pgvector:pg16` já traz tudo pronto:

```bash
docker run --name autostore-db \
  -e POSTGRES_PASSWORD=123 \
  -e POSTGRES_DB=continentalmotors \
  -p 5432:5432 -d pgvector/pgvector:pg16
```

---

## Configuração

### 1. Instale as dependências

```bash
npm install
```

O `postinstall` roda `prisma generate` automaticamente.

### 2. Variáveis de ambiente

Crie um arquivo `.env` na raiz do backend:

```env
DATABASE_URL="postgresql://postgres:123@localhost:5432/continentalmotors?schema=public"
GEMINI_API_KEY="sua_chave_do_gemini_aqui"
PORT=3333
# Opcional: origem permitida para CORS (default: http://localhost:3000).
# Configure com a URL real do front-end em produção.
# FRONTEND_URL="http://localhost:3000"
```

> **Importante (segurança):** o `.env` **nunca** deve ser commitado. Ele já está listado no `.gitignore`. A chave do Gemini não é exposta ao front-end — todas as chamadas à API partem do backend.

---

## Banco de dados e migrations

A tabela de embeddings usa o tipo `vector(768)` do pgvector, que o Prisma não gera sozinho. Por isso, a migration inicial inclui manualmente a ativação da extensão e o índice vetorial.

```bash
# Aplica as migrations (cria carros, leads e embeddings)
npx prisma migrate dev

# Regenera o Prisma Client
npx prisma generate
```

Caso o índice vetorial não exista após a migration, crie-o manualmente:

```bash
psql "postgresql://postgres:123@localhost:5432/continentalmotors" \
  -c "CREATE INDEX IF NOT EXISTS embeddings_vetor_hnsw_idx ON embeddings USING hnsw (vetor vector_cosine_ops);"
```

---

## Carga de dados (seed) e ingestão do RAG

Execute **nesta ordem**:

```bash
# 1. Popula o catálogo com os 15 carros do dataset
npm run seed

# 2. Gera os embeddings da base técnica e indexa no pgvector
npm run rag:ingest
```

O `rag:ingest` lê a base de conhecimento, quebra em ~121 trechos (chunks), gera um embedding para cada um via Gemini e grava tudo no banco. Leva cerca de **1min30s** (respeitando o limite de 100 requisições/minuto do tier gratuito).

Arquivos-fonte do RAG (versionados em `prisma/rag/`):

- `base_tecnica.md` — base de conhecimento enriquecida dos 15 carros
- `carros_enriched.json` — catálogo estruturado (usado para chunks comparativos)

---

## Rodando o servidor

```bash
# Desenvolvimento (recarrega ao salvar)
npm run dev

# Produção
npm start
```

O servidor sobe em `http://localhost:3333`.

---

## Rotas da API

### Catálogo

| Método   | Rota          | Descrição                                              |
| -------- | ------------- | ------------------------------------------------------ |
| `GET`    | `/carros`     | Lista todos os carros                                  |
| `POST`   | `/carros`     | Cadastra um carro                                      |
| `PATCH`  | `/carros/:id` | Atualiza campos de um carro                            |
| `DELETE` | `/carros/:id` | Remove um carro (bloqueado se houver leads vinculados) |

### Leads

| Método | Rota         | Descrição                                          |
| ------ | ------------ | -------------------------------------------------- |
| `GET`  | `/leads`     | Lista todos os leads (com o carro relacionado)     |
| `GET`  | `/leads/:id` | Detalha um lead específico                         |
| `POST` | `/leads`     | Cadastra um lead (nome + email/telefone + carroId) |

### Chat (RAG)

| Método | Rota    | Descrição                                            |
| ------ | ------- | ---------------------------------------------------- |
| `POST` | `/chat` | Responde uma pergunta ancorada nos dados do catálogo |

---

## Roteiro de validação

Com o servidor rodando (`npm run dev`), execute os testes abaixo em outro terminal.

### Catálogo populado

```bash
curl http://localhost:3333/carros
```

Espera-se um array com 15 carros.

### Chat / RAG — respostas ancoradas

```bash
# Dados específicos de um modelo
curl -X POST http://localhost:3333/chat \
  -H "Content-Type: application/json" \
  -d '{"pergunta": "Quais cores e o consumo do Corolla Cross?"}'

# Comparação global (usa chunks comparativos)
curl -X POST http://localhost:3333/chat \
  -H "Content-Type: application/json" \
  -d '{"pergunta": "Qual carro tem o menor preço inicial?"}'

# Fora de escopo (deve recusar sem inventar)
curl -X POST http://localhost:3333/chat \
  -H "Content-Type: application/json" \
  -d '{"pergunta": "Vocês vendem motos?"}'
```

Cada resposta traz o texto (`resposta`) e as `fontes` recuperadas, com a seção e a similaridade de cada trecho usado.

### Captura e consulta de leads (persistência)

```bash
# Cria um lead
curl -X POST http://localhost:3333/leads \
  -H "Content-Type: application/json" \
  -d '{"nome": "Maria Silva", "email": "maria@email.com", "carroId": 1, "mensagem": "Tenho interesse no Corolla."}'

# Consulta os leads (valida a persistência)
curl http://localhost:3333/leads
```

Reinicie a aplicação e rode `GET /leads` novamente: o lead continua lá (persistência durável em banco).

---

## Decisões técnicas e trade-offs

### Vector store: pgvector no próprio PostgreSQL

Optou-se por `pgvector` em vez de um serviço vetorial dedicado (Pinecone, Qdrant). Como o projeto já usa Postgres para carros e leads, isso evita infraestrutura extra e mantém tudo em um único banco. Para 121 chunks, a performance é irrelevante — a decisão prioriza simplicidade e reprodutibilidade.

### Chunking por seção (não por carro inteiro)

A base de cada carro é dividida em seções independentes (dados canônicos, contexto, casos de uso, trade-offs, FAQ, palavras-chave). Cada seção vira um chunk, ancorado com o nome do carro no início. Isso dá precisão cirúrgica em perguntas específicas ("qual o consumo do X?") sem perder as comparativas, que são cobertas recuperando os 5 trechos mais relevantes (top-K). Um único chunk por carro diluiria o significado e prejudicaria as perguntas específicas.

### Chunks comparativos sintéticos

Além da base técnica, o script de ingestão gera chunks derivados do JSON estruturado (carro mais barato, modelos por categoria, elétricos, por montadora, diesel). Isso ancora diretamente as perguntas globais de comparação do desafio, que de outra forma dependeriam de o modelo cruzar dados de vários carros.

### Dimensão dos embeddings: 768 (com normalização manual)

O `gemini-embedding-001` gera 3072 dimensões por padrão, mas suporta truncamento (Matryoshka) para 768 com perda de qualidade desprezível e 1/4 do armazenamento. Como o modelo **não** normaliza automaticamente dimensões diferentes de 3072, o cliente aplica normalização L2 manual — necessária para que a distância de cosseno do pgvector funcione corretamente.

### task_type assimétrico

Na indexação usa-se `RETRIEVAL_DOCUMENT`; nas perguntas do usuário, `RETRIEVAL_QUERY`. Pergunta e resposta não são semanticamente idênticas, e essa distinção melhora a qualidade do retrieval.

### Anti-alucinação

A temperatura de geração é baixa (0.2) e o prompt instrui o modelo a responder **apenas** com base no contexto recuperado, admitindo desconhecimento quando o dado não está na base. Isso atende à exigência do desafio de penalizar respostas inventadas.

### Resiliência a rate limit

O cliente Gemini implementa retry com backoff no erro 429, e a ingestão respeita o limite do tier gratuito (100 req/min). A ingestão é idempotente: pode ser re-executada sem duplicar dados.

---

## Limitações conhecidas

- A base indexada é o markdown enriquecido derivado da base técnica em PDF; contém todo o conteúdo do PDF original mais contexto adicional.
- O tier gratuito do Gemini limita 100 requisições de embedding por minuto; a ingestão foi calibrada para isso.
- O índice HNSW é gerenciado via SQL na migration, pois o Prisma não descreve índices vetoriais nativamente.

---

## Estrutura do projeto

```
backend/
├── prisma/
│   ├── schema.prisma        # modelos Carro, Lead, Embedding
│   ├── seed.ts              # carga dos 15 carros
│   ├── ingest.ts            # ingestão do RAG (embeddings)
│   ├── migrations/          # migrations (com setup do pgvector)
│   └── rag/
│       ├── base_tecnica.md
│       └── carros_enriched.json
├── src/
│   ├── server.ts            # rotas HTTP
│   ├── lib/
│   │   └── gemini.ts        # cliente Gemini (embeddings + geração)
│   └── rag/
│       ├── chunking.ts      # chunking por seção
│       ├── comparativos.ts  # chunks comparativos sintéticos
│       ├── retrieval.ts     # busca vetorial (pgvector)
│       └── geracao.ts       # montagem do prompt + resposta
├── .env                     # (não versionado)
├── package.json
└── tsconfig.json
```
