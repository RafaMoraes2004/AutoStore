import { PrismaClient } from "@prisma/client";
import { gerarEmbedding } from "../lib/gemini.js";

export interface ChunkRecuperado {
  id: number;
  secao: string;
  conteudo: string;
  slug: string | null;
  carroId: number | null;
  similaridade: number;
}

const TOP_K_PADRAO = 5;

function vetorParaSql(vetor: number[]): string {
  return `[${vetor.join(",")}]`;
}

export async function buscarChunksRelevantes(
  prisma: PrismaClient,
  pergunta: string,
  topK: number = TOP_K_PADRAO
): Promise<ChunkRecuperado[]> {
  const vetorPergunta = await gerarEmbedding(pergunta, "RETRIEVAL_QUERY");
  const vetorSql = vetorParaSql(vetorPergunta);

  const resultados = await prisma.$queryRaw<
    Array<{
      id: number;
      secao: string;
      conteudo: string;
      slug: string | null;
      carroId: number | null;
      distancia: number;
    }>
  >`
    SELECT
      "id",
      "secao",
      "conteudo",
      "slug",
      "carroId",
      ("vetor" <=> ${vetorSql}::vector) AS "distancia"
    FROM "embeddings"
    WHERE "vetor" IS NOT NULL
    ORDER BY "vetor" <=> ${vetorSql}::vector
    LIMIT ${topK};
  `;

  return resultados.map((r) => ({
    id: r.id,
    secao: r.secao,
    conteudo: r.conteudo,
    slug: r.slug,
    carroId: r.carroId,
    similaridade: 1 - Number(r.distancia),
  }));
}
