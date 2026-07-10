import { describe, expect, it } from "vitest";
import { montarPrompt } from "../../src/rag/geracao.js";
import type { ChunkRecuperado } from "../../src/rag/retrieval.js";

function criarChunk(overrides: Partial<ChunkRecuperado> = {}): ChunkRecuperado {
  return {
    id: 1,
    secao: "Toyota Corolla — Dados canônicos do pacote",
    conteudo: "Consumo: 11 a 14 km/l.",
    slug: "toyota-corolla",
    carroId: 1,
    similaridade: 0.75,
    ...overrides,
  };
}

describe("montarPrompt", () => {
  it("inclui a pergunta do cliente", () => {
    const prompt = montarPrompt("Qual o consumo do Corolla?", [criarChunk()]);
    expect(prompt).toContain("PERGUNTA ATUAL DO CLIENTE: Qual o consumo do Corolla?");
  });

  it("inclui o conteúdo dos chunks recuperados dentro do bloco de contexto", () => {
    const chunk = criarChunk({ conteudo: "Consumo: 11 a 14 km/l." });
    const prompt = montarPrompt("Qual o consumo?", [chunk]);

    expect(prompt).toContain("=== CONTEXTO ===");
    expect(prompt).toContain("Consumo: 11 a 14 km/l.");
    expect(prompt).toContain(chunk.secao);
  });

  it("inclui múltiplos chunks separados por delimitador", () => {
    const chunks = [
      criarChunk({ id: 1, secao: "Trecho A", conteudo: "Conteúdo A" }),
      criarChunk({ id: 2, secao: "Trecho B", conteudo: "Conteúdo B" }),
    ];
    const prompt = montarPrompt("pergunta", chunks);

    expect(prompt).toContain("Conteúdo A");
    expect(prompt).toContain("Conteúdo B");
    expect(prompt.indexOf("Conteúdo A")).toBeLessThan(prompt.indexOf("Conteúdo B"));
  });

  it("inclui as regras anti-alucinação na instrução do sistema", () => {
    const prompt = montarPrompt("pergunta", [criarChunk()]);
    expect(prompt).toContain("Responda apenas com base no CONTEXTO");
    expect(prompt).toContain("Nunca invente preços, versões, potências");
  });

  it("não inclui bloco de histórico quando não há histórico", () => {
    const prompt = montarPrompt("pergunta", [criarChunk()], []);
    expect(prompt).not.toContain("HISTÓRICO DA CONVERSA");
  });

  it("inclui o histórico formatado quando presente", () => {
    const prompt = montarPrompt("pergunta atual", [criarChunk()], [
      { autor: "usuario", texto: "Qual o preço do Corolla?" },
      { autor: "assistente", texto: "O Corolla custa R$ 160.000." },
    ]);

    expect(prompt).toContain("=== HISTÓRICO DA CONVERSA ===");
    expect(prompt).toContain("Cliente: Qual o preço do Corolla?");
    expect(prompt).toContain("Assistente: O Corolla custa R$ 160.000.");
  });
});
