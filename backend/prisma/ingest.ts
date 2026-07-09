import "dotenv/config";
import * as path from "node:path";
import { PrismaClient } from "@prisma/client";
import { gerarChunks, type Chunk } from "../src/rag/chunking.js";
import { gerarChunksComparativos } from "../src/rag/comparativos.js";
import { gerarEmbedding, EMBEDDING_DIMENSIONS } from "../src/lib/gemini.js";

const prisma = new PrismaClient();

const RAG_DIR = path.join(import.meta.dirname, "rag");
const MARKDOWN_PATH = path.join(RAG_DIR, "base_tecnica.md");
const JSON_PATH = path.join(RAG_DIR, "carros_enriched.json");

// Tier gratuito do Gemini: 100 requisicoes de embedding por minuto.
// 700ms de pausa => ~85 req/min, com folga de seguranca contra o limite.
const PAUSA_ENTRE_CHAMADAS_MS = 700;

function pausa(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function vetorParaSql(vetor: number[]): string {
  return `[${vetor.join(",")}]`;
}

async function main() {
  console.log("=== Ingestão do RAG — Continental Motors ===\n");

  const chunksBase = gerarChunks(MARKDOWN_PATH, JSON_PATH);
  const chunksComparativos = gerarChunksComparativos(JSON_PATH);
  const chunks: Chunk[] = [...chunksBase, ...chunksComparativos];

  console.log(`Chunks da base técnica: ${chunksBase.length}`);
  console.log(`Chunks comparativos:    ${chunksComparativos.length}`);
  console.log(`Total a indexar:        ${chunks.length}`);
  console.log(`Dimensão dos vetores:   ${EMBEDDING_DIMENSIONS}\n`);

  console.log("Limpando índice anterior (RNF03: reindexação idempotente)...");
  await prisma.$executeRaw`TRUNCATE TABLE "embeddings" RESTART IDENTITY;`;

  let indexados = 0;
  for (const chunk of chunks) {
    const vetor = await gerarEmbedding(chunk.conteudo, "RETRIEVAL_DOCUMENT");
    const vetorSql = vetorParaSql(vetor);

    await prisma.$executeRaw`
      INSERT INTO "embeddings" ("carroId", "slug", "secao", "conteudo", "vetor", "createdAt")
      VALUES (
        ${chunk.carroId},
        ${chunk.slug},
        ${chunk.secao},
        ${chunk.conteudo},
        ${vetorSql}::vector,
        NOW()
      );
    `;

    indexados += 1;
    if (indexados % 10 === 0 || indexados === chunks.length) {
      console.log(`  [${indexados}/${chunks.length}] ${chunk.secao}`);
    }

    await pausa(PAUSA_ENTRE_CHAMADAS_MS);
  }

  console.log(`\nSucesso! ${indexados} chunks indexados no vector store.`);
}

main()
  .catch((e) => {
    console.error("Erro na ingestão:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
