import { describe, expect, it } from "vitest";
import {
  isTextoCurtoValido,
  isTextoLongoValido,
  parseId,
  validarLead,
} from "../../src/lib/validation.js";

describe("parseId", () => {
  it("aceita inteiros positivos em formato string", () => {
    expect(parseId("1")).toBe(1);
    expect(parseId("42")).toBe(42);
    expect(parseId("007")).toBe(7);
  });

  it("rejeita zero", () => {
    expect(parseId("0")).toBeNull();
  });

  it("rejeita números negativos", () => {
    expect(parseId("-5")).toBeNull();
  });

  it("rejeita valores não numéricos", () => {
    expect(parseId("abc")).toBeNull();
    expect(parseId("")).toBeNull();
  });

  it("rejeita números decimais", () => {
    expect(parseId("3.5")).toBeNull();
  });

  it("rejeita undefined", () => {
    expect(parseId(undefined)).toBeNull();
  });

  it("rejeita arrays (parâmetro de rota repetido)", () => {
    expect(parseId(["1", "2"])).toBeNull();
  });
});

describe("validarLead", () => {
  it("aceita lead válido com email", () => {
    const resultado = validarLead({
      nome: "Ana Silva",
      email: "ana@example.com",
      carroId: 1,
    });
    expect(resultado.valido).toBe(true);
    expect(resultado.carroId).toBe(1);
  });

  it("aceita lead válido com telefone", () => {
    const resultado = validarLead({
      nome: "Ana Silva",
      telefone: "(11) 91234-5678",
      carroId: 1,
    });
    expect(resultado.valido).toBe(true);
  });

  it("aceita carroId enviado como string numérica", () => {
    const resultado = validarLead({
      nome: "Ana Silva",
      email: "ana@example.com",
      carroId: "5",
    });
    expect(resultado.valido).toBe(true);
    expect(resultado.carroId).toBe(5);
  });

  it("aceita mensagem ausente (campo opcional)", () => {
    const resultado = validarLead({
      nome: "Ana Silva",
      email: "ana@example.com",
      carroId: 1,
    });
    expect(resultado.valido).toBe(true);
  });

  it("rejeita nome ausente", () => {
    const resultado = validarLead({
      email: "ana@example.com",
      carroId: 1,
    });
    expect(resultado.valido).toBe(false);
  });

  it("rejeita nome em branco", () => {
    const resultado = validarLead({
      nome: "   ",
      email: "ana@example.com",
      carroId: 1,
    });
    expect(resultado.valido).toBe(false);
  });

  it("rejeita nome acima de 120 caracteres", () => {
    const resultado = validarLead({
      nome: "a".repeat(121),
      email: "ana@example.com",
      carroId: 1,
    });
    expect(resultado.valido).toBe(false);
  });

  it("rejeita quando não há email nem telefone", () => {
    const resultado = validarLead({
      nome: "Ana Silva",
      carroId: 1,
    });
    expect(resultado.valido).toBe(false);
  });

  it("rejeita email malformado", () => {
    const resultado = validarLead({
      nome: "Ana Silva",
      email: "ana-arroba-example.com",
      carroId: 1,
    });
    expect(resultado.valido).toBe(false);
  });

  it("rejeita telefone malformado (curto demais)", () => {
    const resultado = validarLead({
      nome: "Ana Silva",
      telefone: "123",
      carroId: 1,
    });
    expect(resultado.valido).toBe(false);
  });

  it("aceita quando o email é inválido mas o telefone é válido", () => {
    const resultado = validarLead({
      nome: "Ana Silva",
      email: "invalido",
      telefone: "(11) 91234-5678",
      carroId: 1,
    });
    expect(resultado.valido).toBe(true);
  });

  it("rejeita carroId ausente", () => {
    const resultado = validarLead({
      nome: "Ana Silva",
      email: "ana@example.com",
    });
    expect(resultado.valido).toBe(false);
  });

  it("rejeita carroId zero ou negativo", () => {
    expect(
      validarLead({ nome: "Ana Silva", email: "ana@example.com", carroId: 0 })
        .valido
    ).toBe(false);
    expect(
      validarLead({ nome: "Ana Silva", email: "ana@example.com", carroId: -3 })
        .valido
    ).toBe(false);
  });

  it("rejeita carroId não numérico", () => {
    const resultado = validarLead({
      nome: "Ana Silva",
      email: "ana@example.com",
      carroId: "abc",
    });
    expect(resultado.valido).toBe(false);
  });

  it("rejeita mensagem acima de 1000 caracteres", () => {
    const resultado = validarLead({
      nome: "Ana Silva",
      email: "ana@example.com",
      carroId: 1,
      mensagem: "a".repeat(1001),
    });
    expect(resultado.valido).toBe(false);
  });
});

describe("isTextoCurtoValido", () => {
  it("aceita texto normal dentro do limite", () => {
    expect(isTextoCurtoValido("Toyota")).toBe(true);
  });

  it("rejeita string vazia", () => {
    expect(isTextoCurtoValido("")).toBe(false);
    expect(isTextoCurtoValido("   ")).toBe(false);
  });

  it("rejeita texto acima de 200 caracteres (proteção contra abuso de payload)", () => {
    expect(isTextoCurtoValido("a".repeat(201))).toBe(false);
    expect(isTextoCurtoValido("a".repeat(200))).toBe(true);
  });

  it("rejeita valores que não são string", () => {
    expect(isTextoCurtoValido(123)).toBe(false);
    expect(isTextoCurtoValido(null)).toBe(false);
  });
});

describe("isTextoLongoValido", () => {
  it("aceita texto longo dentro do limite", () => {
    expect(isTextoLongoValido("a".repeat(5000))).toBe(true);
  });

  it("rejeita texto acima de 5000 caracteres", () => {
    expect(isTextoLongoValido("a".repeat(5001))).toBe(false);
  });

  it("rejeita string vazia", () => {
    expect(isTextoLongoValido("")).toBe(false);
  });
});
