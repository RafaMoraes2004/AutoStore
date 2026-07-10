import { describe, expect, it } from "vitest";
import { formatarTelefone } from "./telefone";

describe("formatarTelefone", () => {
  it("aplica máscara de celular (11 dígitos)", () => {
    expect(formatarTelefone("11999998888")).toBe("(11) 99999-8888");
  });

  it("aplica máscara de telefone fixo (10 dígitos)", () => {
    expect(formatarTelefone("1133334444")).toBe("(11) 3333-4444");
  });

  it("ignora letras e outros caracteres não numéricos", () => {
    expect(formatarTelefone("(11) a9x9999-8888")).toBe("(11) 99999-8888");
  });

  it("corta dígitos excedentes além de 11", () => {
    expect(formatarTelefone("119999988889999")).toBe("(11) 99999-8888");
  });

  it("é idempotente ao reaplicar sobre um valor já formatado", () => {
    const formatado = formatarTelefone("11999998888");
    expect(formatarTelefone(formatado)).toBe(formatado);
  });

  it("retorna string vazia quando não há dígitos", () => {
    expect(formatarTelefone("")).toBe("");
    expect(formatarTelefone("abc")).toBe("");
  });

  it("aplica a máscara progressivamente conforme o usuário digita", () => {
    expect(formatarTelefone("1")).toBe("(1");
    expect(formatarTelefone("11")).toBe("(11");
    expect(formatarTelefone("119")).toBe("(11) 9");
    expect(formatarTelefone("119999")).toBe("(11) 9999");
    expect(formatarTelefone("1199999")).toBe("(11) 9999-9");
  });
});
