import { describe, expect, it } from "vitest";
import { construirQueryBusca, validarHistorico } from "../../src/rag/queryBusca.js";

describe("validarHistorico", () => {
  it("retorna array vazio quando não é um array", () => {
    expect(validarHistorico(undefined)).toEqual([]);
    expect(validarHistorico(null)).toEqual([]);
    expect(validarHistorico("não é array")).toEqual([]);
    expect(validarHistorico({ autor: "usuario", texto: "oi" })).toEqual([]);
  });

  it("mantém mensagens válidas", () => {
    const historico = [
      { autor: "usuario", texto: "Qual o preço do Onix?" },
      { autor: "assistente", texto: "O Onix custa R$ 99.990." },
    ];
    expect(validarHistorico(historico)).toEqual(historico);
  });

  it("descarta entradas com autor inválido", () => {
    const historico = [{ autor: "sistema", texto: "algo" }];
    expect(validarHistorico(historico)).toEqual([]);
  });

  it("descarta entradas com texto vazio ou ausente", () => {
    const historico = [
      { autor: "usuario", texto: "" },
      { autor: "usuario", texto: "   " },
      { autor: "usuario" },
      { autor: "usuario", texto: 123 },
    ];
    expect(validarHistorico(historico)).toEqual([]);
  });

  it("descarta entradas nulas ou que não são objetos", () => {
    const historico = [null, "texto solto", 42, { autor: "usuario", texto: "válida" }];
    expect(validarHistorico(historico)).toEqual([
      { autor: "usuario", texto: "válida" },
    ]);
  });

  it("mantém apenas as últimas 6 mensagens", () => {
    const historico = Array.from({ length: 8 }, (_, i) => ({
      autor: i % 2 === 0 ? "usuario" : "assistente",
      texto: `mensagem ${i}`,
    }));

    const resultado = validarHistorico(historico);
    expect(resultado).toHaveLength(6);
    expect(resultado[0]?.texto).toBe("mensagem 2");
    expect(resultado[5]?.texto).toBe("mensagem 7");
  });
});

describe("construirQueryBusca", () => {
  it("mantém a pergunta original quando é longa e não tem indícios de follow-up", () => {
    const pergunta = "Quais são os carros elétricos disponíveis no catálogo atualmente?";
    const resultado = construirQueryBusca(pergunta, [
      { autor: "usuario", texto: "Qual o preço do Corolla?" },
    ]);
    expect(resultado).toBe(pergunta);
  });

  it("combina com a última pergunta do usuário quando o texto é curto", () => {
    const resultado = construirQueryBusca("e o consumo?", [
      { autor: "usuario", texto: "Qual o preço do Corolla?" },
      { autor: "assistente", texto: "O Corolla custa R$ 160.000." },
    ]);
    expect(resultado).toBe("Qual o preço do Corolla? e o consumo?");
  });

  it("combina com a última pergunta do usuário quando contém pronome de follow-up, mesmo sendo uma frase longa", () => {
    const pergunta = "e sobre esse carro, ele tem opção de câmbio automático disponível?";
    const resultado = construirQueryBusca(pergunta, [
      { autor: "usuario", texto: "Qual o preço do Corolla?" },
    ]);
    expect(resultado).toBe(`Qual o preço do Corolla? ${pergunta}`);
  });

  it("não combina quando não há pergunta anterior do usuário no histórico", () => {
    const resultado = construirQueryBusca("e o consumo?", [
      { autor: "assistente", texto: "Posso ajudar com o catálogo." },
    ]);
    expect(resultado).toBe("e o consumo?");
  });

  it("não combina quando o histórico está vazio", () => {
    const resultado = construirQueryBusca("e o consumo?", []);
    expect(resultado).toBe("e o consumo?");
  });

  it("remove espaços nas extremidades da pergunta", () => {
    const resultado = construirQueryBusca("  qual o preço do Onix?  ", []);
    expect(resultado).toBe("qual o preço do Onix?");
  });

  it("usa a pergunta do usuário mais recente, não a mais antiga", () => {
    const resultado = construirQueryBusca("e a garantia?", [
      { autor: "usuario", texto: "Qual o preço do Corolla?" },
      { autor: "assistente", texto: "R$ 160.000." },
      { autor: "usuario", texto: "Qual o preço do Onix?" },
      { autor: "assistente", texto: "R$ 99.990." },
    ]);
    expect(resultado).toBe("Qual o preço do Onix? e a garantia?");
  });
});
