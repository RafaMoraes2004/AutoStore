import type { FonteChat } from "@/lib/types";

const LIMIAR_SIMILARIDADE_RELEVANTE = 0.5;
const LIMIAR_DOMINANCIA = 0.6;

export function obterCarroSugerido(
  fontes: FonteChat[] | undefined
): { id: number; nome: string } | null {
  if (!fontes || fontes.length === 0) return null;

  const relevantes = fontes.filter(
    (f) => f.similaridade >= LIMIAR_SIMILARIDADE_RELEVANTE
  );
  if (relevantes.length === 0) return null;

  // Fontes sem carroId (chunks "Comparativo —" ou de base de conhecimento) indicam
  // resposta comparativa/genérica: sua presença entre as fontes relevantes veta a
  // sugestão, mesmo que um único carroId específico domine as demais fontes.
  if (relevantes.some((f) => f.carroId === null)) return null;

  const contagem = new Map<number, { nome: string; total: number }>();
  for (const f of relevantes) {
    const carroId = f.carroId as number;
    const nome = f.secao.split("—")[0]?.trim() ?? "este carro";
    const atual = contagem.get(carroId);
    contagem.set(carroId, {
      nome,
      total: (atual?.total ?? 0) + 1,
    });
  }

  let melhorId: number | null = null;
  let melhorTotal = 0;
  for (const [id, dados] of contagem) {
    if (dados.total > melhorTotal) {
      melhorTotal = dados.total;
      melhorId = id;
    }
  }

  if (melhorId === null) return null;
  const dominancia = melhorTotal / relevantes.length;
  if (dominancia < LIMIAR_DOMINANCIA) return null;

  const dados = contagem.get(melhorId)!;
  return { id: melhorId, nome: dados.nome };
}
