import { describe, expect, it } from "vitest";
import { formatarPreco, inferirMotorizacao, resolverImagem } from "./format";

describe("formatarPreco", () => {
  it("formata valores inteiros em BRL sem casas decimais", () => {
    expect(formatarPreco(160000)).toBe("R$ 160.000");
    expect(formatarPreco(99990)).toBe("R$ 99.990");
    expect(formatarPreco(1000000)).toBe("R$ 1.000.000");
  });

  it("formata zero corretamente", () => {
    expect(formatarPreco(0)).toBe("R$ 0");
  });
});

describe("inferirMotorizacao", () => {
  it("classifica motor híbrido a partir de exemplo real do catálogo", () => {
    expect(inferirMotorizacao("2.0 Flex (ou Híbrido 1.8)")).toBe("Híbrido");
  });

  it("classifica motor a diesel a partir de exemplo real do catálogo", () => {
    expect(inferirMotorizacao("2.8 Turbodiesel")).toBe("Diesel");
  });

  it("classifica motor elétrico a partir de exemplo real do catálogo", () => {
    expect(inferirMotorizacao("Elétrico (bateria BYD Blade)")).toBe("Elétrico");
  });

  it("classifica como combustão quando não há indício de outra motorização", () => {
    expect(inferirMotorizacao("1.0 aspirado / 1.0 turbo")).toBe("Combustão");
  });

  it("é case-insensitive", () => {
    expect(inferirMotorizacao("2.8 TURBODIESEL")).toBe("Diesel");
    expect(inferirMotorizacao("ELÉTRICO")).toBe("Elétrico");
  });

  it("reconhece variantes sem acentuação", () => {
    expect(inferirMotorizacao("motor hibrido flex")).toBe("Híbrido");
    expect(inferirMotorizacao("motor eletrico")).toBe("Elétrico");
  });

  it("dá prioridade a elétrico quando o texto também menciona híbrido", () => {
    expect(inferirMotorizacao("Híbrido plug-in 100% elétrico")).toBe("Elétrico");
  });
});

describe("resolverImagem", () => {
  it("monta o caminho absoluto quando falta a barra inicial", () => {
    expect(resolverImagem("imagens/toyota_corolla.jpg")).toBe(
      "/imagens/toyota_corolla.jpg"
    );
  });

  it("mantém o caminho quando já começa com barra", () => {
    expect(resolverImagem("/imagens/toyota_corolla.jpg")).toBe(
      "/imagens/toyota_corolla.jpg"
    );
  });

  it("retorna a imagem de fallback quando o caminho é null", () => {
    expect(resolverImagem(null)).toBe("/imagens/_placeholder.svg");
  });

  it("retorna a imagem de fallback quando o caminho é uma string vazia", () => {
    expect(resolverImagem("")).toBe("/imagens/_placeholder.svg");
  });
});
