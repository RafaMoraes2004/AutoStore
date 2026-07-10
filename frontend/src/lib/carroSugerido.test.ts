import { describe, expect, it } from "vitest";
import { obterCarroSugerido } from "./carroSugerido";
import type { FonteChat } from "@/lib/types";

describe("obterCarroSugerido", () => {
  it("sugere o carro quando as fontes apontam claramente para um único carro", () => {
    const fontes: FonteChat[] = [
      { secao: "Toyota Corolla — Dados canônicos do pacote", slug: "toyota-corolla", carroId: 1, similaridade: 0.7581 },
      { secao: "Toyota Corolla — Perguntas frequentes", slug: "toyota-corolla", carroId: 1, similaridade: 0.7442 },
      { secao: "Toyota Corolla — Contexto enriquecido", slug: "toyota-corolla", carroId: 1, similaridade: 0.7302 },
      { secao: "Toyota Corolla — Palavras-chave para busca", slug: "toyota-corolla", carroId: 1, similaridade: 0.7125 },
      { secao: "Toyota Corolla — Trade-offs", slug: "toyota-corolla", carroId: 1, similaridade: 0.7116 },
    ];

    expect(obterCarroSugerido(fontes)).toEqual({ id: 1, nome: "Toyota Corolla" });
  });

  it("não sugere carro em resposta comparativa entre dois modelos", () => {
    const fontes: FonteChat[] = [
      { secao: "Comparativo — Categoria Hatch", slug: null, carroId: null, similaridade: 0.7462 },
      { secao: "Hyundai HB20S — Perguntas frequentes", slug: "hyundai-hb20s", carroId: 11, similaridade: 0.7407 },
      { secao: "Chevrolet Onix — Trade-offs", slug: "chevrolet-onix", carroId: 7, similaridade: 0.7192 },
      { secao: "Hyundai HB20 — Perguntas frequentes", slug: "hyundai-hb20", carroId: 10, similaridade: 0.7185 },
      { secao: "Hyundai HB20S — Contexto enriquecido", slug: "hyundai-hb20s", carroId: 11, similaridade: 0.7075 },
    ];

    expect(obterCarroSugerido(fontes)).toBeNull();
  });

  it("não sugere carro em resposta de listagem, mesmo quando um carroId específico domina as fontes numericamente (regressão do bug)", () => {
    const fontes: FonteChat[] = [
      { secao: "Comparativo — Modelos da Toyota", slug: null, carroId: null, similaridade: 0.7492 },
      { secao: "Toyota Corolla — Contexto enriquecido", slug: "toyota-corolla", carroId: 1, similaridade: 0.6914 },
      { secao: "Toyota Corolla — Perguntas frequentes", slug: "toyota-corolla", carroId: 1, similaridade: 0.6884 },
      { secao: "Toyota Corolla — Evidências externas", slug: "toyota-corolla", carroId: 1, similaridade: 0.6844 },
      { secao: "Toyota Corolla — Dados canônicos do pacote", slug: "toyota-corolla", carroId: 1, similaridade: 0.6821 },
    ];

    expect(obterCarroSugerido(fontes)).toBeNull();
  });

  it("não sugere carro quando não há dominância clara entre carros diferentes", () => {
    const fontes: FonteChat[] = [
      { secao: "Chevrolet Onix — Trade-offs", slug: "chevrolet-onix", carroId: 7, similaridade: 0.72 },
      { secao: "Chevrolet Onix — Perguntas frequentes", slug: "chevrolet-onix", carroId: 7, similaridade: 0.71 },
      { secao: "Hyundai HB20 — Trade-offs", slug: "hyundai-hb20", carroId: 10, similaridade: 0.7 },
      { secao: "Hyundai HB20 — Perguntas frequentes", slug: "hyundai-hb20", carroId: 10, similaridade: 0.69 },
      { secao: "Volkswagen Polo — Trade-offs", slug: "volkswagen-polo", carroId: 4, similaridade: 0.68 },
    ];

    expect(obterCarroSugerido(fontes)).toBeNull();
  });

  it("retorna null quando não há fontes", () => {
    expect(obterCarroSugerido(undefined)).toBeNull();
    expect(obterCarroSugerido([])).toBeNull();
  });

  it("ignora fontes de baixa similaridade (ruído) mesmo repetindo o mesmo carroId", () => {
    const fontes: FonteChat[] = [
      { secao: "Toyota Corolla — Curiosidade", slug: "toyota-corolla", carroId: 1, similaridade: 0.31 },
      { secao: "Toyota Corolla — Nota de rodapé", slug: "toyota-corolla", carroId: 1, similaridade: 0.28 },
    ];

    expect(obterCarroSugerido(fontes)).toBeNull();
  });

  it("desconsidera uma fonte de baixa similaridade de outro carro ao calcular a dominância", () => {
    const fontes: FonteChat[] = [
      { secao: "Toyota Corolla — Dados canônicos do pacote", slug: "toyota-corolla", carroId: 1, similaridade: 0.75 },
      { secao: "Toyota Corolla — Perguntas frequentes", slug: "toyota-corolla", carroId: 1, similaridade: 0.72 },
      { secao: "Toyota Corolla — Trade-offs", slug: "toyota-corolla", carroId: 1, similaridade: 0.7 },
      { secao: "Chevrolet Onix — Curiosidade", slug: "chevrolet-onix", carroId: 7, similaridade: 0.42 },
    ];

    expect(obterCarroSugerido(fontes)).toEqual({ id: 1, nome: "Toyota Corolla" });
  });
});
