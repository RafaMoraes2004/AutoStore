import { beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";

const mockPrisma = vi.hoisted(() => ({
  carro: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
  },
}));

vi.mock("../../src/lib/prisma.js", () => ({ prisma: mockPrisma }));

const { app } = await import("../../src/app.js");

const CARRO_EXEMPLO = {
  id: 1,
  montadora: "Toyota",
  modelo: "Corolla",
  categoria: "Sedan",
  ano: 2026,
  preco_a_partir_rs: 160000,
};

beforeEach(() => {
  vi.resetAllMocks();
});

describe("GET /carros", () => {
  it("retorna 200 com a lista de carros", async () => {
    mockPrisma.carro.findMany.mockResolvedValue([CARRO_EXEMPLO]);

    const resposta = await request(app).get("/carros");

    expect(resposta.status).toBe(200);
    expect(resposta.body).toEqual([CARRO_EXEMPLO]);
    expect(mockPrisma.carro.findMany).toHaveBeenCalledWith({
      orderBy: { id: "asc" },
    });
  });

  it("retorna 500 quando o banco falha", async () => {
    mockPrisma.carro.findMany.mockRejectedValue(new Error("conexão perdida"));

    const resposta = await request(app).get("/carros");

    expect(resposta.status).toBe(500);
  });
});

describe("GET /carros/:id", () => {
  it("retorna 200 com o carro quando existe", async () => {
    mockPrisma.carro.findUnique.mockResolvedValue(CARRO_EXEMPLO);

    const resposta = await request(app).get("/carros/1");

    expect(resposta.status).toBe(200);
    expect(resposta.body).toEqual(CARRO_EXEMPLO);
    expect(mockPrisma.carro.findUnique).toHaveBeenCalledWith({
      where: { id: 1 },
    });
  });

  it("retorna 404 quando o carro não existe", async () => {
    mockPrisma.carro.findUnique.mockResolvedValue(null);

    const resposta = await request(app).get("/carros/999");

    expect(resposta.status).toBe(404);
    expect(resposta.body).toEqual({ erro: "Carro não encontrado." });
  });

  it("retorna 400 para id inválido (não numérico)", async () => {
    const resposta = await request(app).get("/carros/abc");

    expect(resposta.status).toBe(400);
    expect(mockPrisma.carro.findUnique).not.toHaveBeenCalled();
  });

  it("retorna 400 para id zero ou negativo", async () => {
    const respostaZero = await request(app).get("/carros/0");
    const respostaNegativa = await request(app).get("/carros/-1");

    expect(respostaZero.status).toBe(400);
    expect(respostaNegativa.status).toBe(400);
  });
});
