import { beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";

const mockPrisma = vi.hoisted(() => ({
  carro: {
    findUnique: vi.fn(),
  },
  lead: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
  },
}));

vi.mock("../../src/lib/prisma.js", () => ({ prisma: mockPrisma }));

const { app } = await import("../../src/app.js");

const LEAD_EXEMPLO = {
  id: 1,
  nome: "Ana Silva",
  email: "ana@example.com",
  telefone: null,
  mensagem: null,
  carroId: 1,
  createdAt: new Date().toISOString(),
  carro: { id: 1, montadora: "Toyota", modelo: "Corolla" },
};

beforeEach(() => {
  vi.resetAllMocks();
});

describe("POST /leads", () => {
  it("cria o lead e retorna 201 quando os dados são válidos e o carro existe", async () => {
    mockPrisma.carro.findUnique.mockResolvedValue({ id: 1 });
    mockPrisma.lead.create.mockResolvedValue(LEAD_EXEMPLO);

    const resposta = await request(app).post("/leads").send({
      nome: "Ana Silva",
      email: "ana@example.com",
      carroId: 1,
    });

    expect(resposta.status).toBe(201);
    expect(resposta.body).toEqual(LEAD_EXEMPLO);
    expect(mockPrisma.lead.create).toHaveBeenCalledWith({
      data: {
        nome: "Ana Silva",
        email: "ana@example.com",
        telefone: null,
        mensagem: null,
        carroId: 1,
      },
      include: { carro: true },
    });
  });

  it("retorna 400 quando o nome está ausente", async () => {
    const resposta = await request(app).post("/leads").send({
      email: "ana@example.com",
      carroId: 1,
    });

    expect(resposta.status).toBe(400);
    expect(mockPrisma.lead.create).not.toHaveBeenCalled();
  });

  it("retorna 400 quando não há email nem telefone", async () => {
    const resposta = await request(app).post("/leads").send({
      nome: "Ana Silva",
      carroId: 1,
    });

    expect(resposta.status).toBe(400);
    expect(mockPrisma.lead.create).not.toHaveBeenCalled();
  });

  it("retorna 400 quando carroId está ausente", async () => {
    const resposta = await request(app).post("/leads").send({
      nome: "Ana Silva",
      email: "ana@example.com",
    });

    expect(resposta.status).toBe(400);
    expect(mockPrisma.carro.findUnique).not.toHaveBeenCalled();
  });

  it("retorna 404 quando o carro de interesse não existe", async () => {
    mockPrisma.carro.findUnique.mockResolvedValue(null);

    const resposta = await request(app).post("/leads").send({
      nome: "Ana Silva",
      email: "ana@example.com",
      carroId: 999,
    });

    expect(resposta.status).toBe(404);
    expect(resposta.body).toEqual({ erro: "Carro de interesse não encontrado." });
    expect(mockPrisma.lead.create).not.toHaveBeenCalled();
  });
});

describe("GET /leads", () => {
  it("retorna 200 com a lista de leads", async () => {
    mockPrisma.lead.findMany.mockResolvedValue([LEAD_EXEMPLO]);

    const resposta = await request(app).get("/leads");

    expect(resposta.status).toBe(200);
    expect(resposta.body).toEqual([LEAD_EXEMPLO]);
  });
});

describe("GET /leads/:id", () => {
  it("retorna 200 com o lead quando existe", async () => {
    mockPrisma.lead.findUnique.mockResolvedValue(LEAD_EXEMPLO);

    const resposta = await request(app).get("/leads/1");

    expect(resposta.status).toBe(200);
    expect(resposta.body).toEqual(LEAD_EXEMPLO);
  });

  it("retorna 404 quando o lead não existe", async () => {
    mockPrisma.lead.findUnique.mockResolvedValue(null);

    const resposta = await request(app).get("/leads/999");

    expect(resposta.status).toBe(404);
  });

  it("retorna 400 para id inválido", async () => {
    const resposta = await request(app).get("/leads/abc");

    expect(resposta.status).toBe(400);
    expect(mockPrisma.lead.findUnique).not.toHaveBeenCalled();
  });
});
