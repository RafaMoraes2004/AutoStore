import { gerarResposta } from "../lib/gemini.js";
import type { ChunkRecuperado } from "./retrieval.js";

export interface MensagemHistorico {
  autor: "usuario" | "assistente";
  texto: string;
}

const INSTRUCAO_SISTEMA = `Você é o assistente virtual da concessionária AutoStore.
Sua função é responder dúvidas de clientes sobre os carros do catálogo, usando EXCLUSIVAMENTE as informações do CONTEXTO fornecido abaixo.

Regras obrigatórias:
1. Responda apenas com base no CONTEXTO. Nunca invente preços, versões, potências ou dados que não estejam ali.
2. Se a informação não estiver no CONTEXTO, diga claramente que não possui esse dado no catálogo, em vez de inventar.
3. Se perguntarem sobre algo fora do escopo da loja (ex.: motos, outras marcas não listadas), informe educadamente que a AutoStore trabalha apenas com os veículos do catálogo.
4. Seja objetivo, cordial e use português do Brasil. Valores em reais.
5. Ao comparar ou recomendar, baseie-se nos dados do CONTEXTO e explique o motivo de forma sucinta.
6. Considere o HISTÓRICO da conversa para entender perguntas de acompanhamento (ex.: "me dê mais detalhes" refere-se ao assunto anterior). Cumprimente apenas na primeira mensagem; não repita saudações se a conversa já começou.`;

function formatarHistorico(historico: MensagemHistorico[]): string {
  if (historico.length === 0) return "";

  const linhas = historico
    .map(
      (m) => `${m.autor === "usuario" ? "Cliente" : "Assistente"}: ${m.texto}`
    )
    .join("\n");

  return `=== HISTÓRICO DA CONVERSA ===
${linhas}
=== FIM DO HISTÓRICO ===

`;
}

export function montarPrompt(
  pergunta: string,
  chunks: ChunkRecuperado[],
  historico: MensagemHistorico[] = []
): string {
  const contexto = chunks
    .map((c, i) => `[Trecho ${i + 1} — ${c.secao}]\n${c.conteudo}`)
    .join("\n\n---\n\n");

  return `${INSTRUCAO_SISTEMA}

${formatarHistorico(historico)}=== CONTEXTO ===
${contexto}
=== FIM DO CONTEXTO ===

PERGUNTA ATUAL DO CLIENTE: ${pergunta}

RESPOSTA:`;
}

export async function responderComContexto(
  pergunta: string,
  chunks: ChunkRecuperado[],
  historico: MensagemHistorico[] = []
): Promise<string> {
  if (chunks.length === 0) {
    return "Não encontrei informações sobre isso no catálogo da AutoStore. Posso ajudar com dúvidas sobre nossos veículos disponíveis.";
  }

  const prompt = montarPrompt(pergunta, chunks, historico);
  return gerarResposta(prompt);
}
