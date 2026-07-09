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
    "preco_a_partir_rs" DOUBLE PRECISION NOT NULL,
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

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_carroId_fkey" FOREIGN KEY ("carroId") REFERENCES "carros"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
