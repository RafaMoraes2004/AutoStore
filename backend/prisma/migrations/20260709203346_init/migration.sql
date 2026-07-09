-- CreateExtension
CREATE EXTENSION IF NOT EXISTS vector;

-- CreateTable
CREATE TABLE "carros" (
    "id" SERIAL NOT NULL,
    "montadora" TEXT NOT NULL,
    "modelo" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "ano" INTEGER NOT NULL,
    "motor" TEXT NOT NULL,
    "potencia_cv" TEXT NOT NULL,
    "cambio" TEXT NOT NULL,
    "consumo" TEXT NOT NULL,
    "preco_a_partir_rs" INTEGER NOT NULL,
    "preco_obs" TEXT,
    "cores" TEXT NOT NULL,
    "itens" TEXT NOT NULL,
    "desc" TEXT NOT NULL,
    "imagem_arquivo" TEXT,
    "imagens" TEXT[],
    "foto_referencia" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "carros_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leads" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT,
    "telefone" TEXT,
    "mensagem" TEXT,
    "carroId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "leads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "embeddings" (
    "id" SERIAL NOT NULL,
    "carroId" INTEGER,
    "slug" TEXT,
    "secao" TEXT NOT NULL,
    "conteudo" TEXT NOT NULL,
    "vetor" vector(768),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "embeddings_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS embeddings_vetor_hnsw_idx
  ON "embeddings"
  USING hnsw (vetor vector_cosine_ops);

-- CreateIndex
CREATE INDEX "carros_categoria_idx" ON "carros"("categoria");

-- CreateIndex
CREATE INDEX "carros_preco_a_partir_rs_idx" ON "carros"("preco_a_partir_rs");

-- CreateIndex
CREATE INDEX "embeddings_carroId_idx" ON "embeddings"("carroId");

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_carroId_fkey" FOREIGN KEY ("carroId") REFERENCES "carros"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
