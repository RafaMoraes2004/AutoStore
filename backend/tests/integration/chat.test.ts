import { beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";

vi.mock("../../src/lib/prisma.js", () => ({ prisma: {} }));

const mockBuscarChunksRelevantes = vi.hoisted(() => vi.fn());
vi.mock("../../src/rag/retrieval.js", () => ({
  buscarChunksRelevantes: mockBuscarChunksRelevantes,
}));

const mockResponderComContexto = vi.hoisted(() => vi.fn());
vi.mock("../../src/rag/geracao.js", () => ({
  responderComContexto: mockResponderComContexto,
}));

const { app } = await import("../../src/app.js");

const CHUNK_EXEMPLO = {
  id: 1,
  secao: "Toyota Corolla — Dados canônicos do pacote",
  conteudo: "Consumo: 11 a 14 km/l.",
  slug: "toyota-corolla",
  carroId: 1,
  similaridade: 0.75812345,
};

beforeEach(() => {
  vi.resetAllMocks();
});

describe("POST /chat", () => {
  it("retorna 400 quando a pergunta está ausente", async () => {
    const resposta = await request(app).post("/chat").send({});

    expect(resposta.status).toBe(400);
    expect(mockBuscarChunksRelevantes).not.toHaveBeenCalled();
  });

  it("retorna 400 quando a pergunta é uma string vazia", async () => {
    const resposta = await request(app).post("/chat").send({ pergunta: "   " });

    expect(resposta.status).toBe(400);
  });

  it("retorna 400 quando a pergunta excede 500 caracteres", async () => {
    const resposta = await request(app)
      .post("/chat")
      .send({ pergunta: "a".repeat(501) });

    expect(resposta.status).toBe(400);
    expect(mockBuscarChunksRelevantes).not.toHaveBeenCalled();
  });

  it("retorna 200 com resposta e fontes no caso de sucesso", async () => {
    mockBuscarChunksRelevantes.mockResolvedValue([CHUNK_EXEMPLO]);
    mockResponderComContexto.mockResolvedValue(
      "O consumo do Corolla é de 11 a 14 km/l."
    );

    const resposta = await request(app)
      .post("/chat")
      .send({ pergunta: "Qual o consumo do Corolla?" });

    expect(resposta.status).toBe(200);
    expect(resposta.body.resposta).toBe("O consumo do Corolla é de 11 a 14 km/l.");
    expect(resposta.body.fontes).toEqual([
      {
        secao: CHUNK_EXEMPLO.secao,
        slug: CHUNK_EXEMPLO.slug,
        carroId: CHUNK_EXEMPLO.carroId,
        similaridade: 0.7581,
      },
    ]);
  });

  it("funciona normalmente quando o histórico enviado é malformado", async () => {
    mockBuscarChunksRelevantes.mockResolvedValue([]);
    mockResponderComContexto.mockResolvedValue("Sem contexto disponível.");

    const resposta = await request(app)
      .post("/chat")
      .send({ pergunta: "Qual o consumo do Corolla?", historico: "não é um array" });

    expect(resposta.status).toBe(200);
    expect(mockResponderComContexto).toHaveBeenCalledWith(
      "Qual o consumo do Corolla?",
      [],
      []
    );
  });

  it("retorna 500 quando a geração da resposta falha", async () => {
    mockBuscarChunksRelevantes.mockResolvedValue([CHUNK_EXEMPLO]);
    mockResponderComContexto.mockRejectedValue(new Error("Gemini indisponível"));

    const resposta = await request(app)
      .post("/chat")
      .send({ pergunta: "Qual o consumo do Corolla?" });

    expect(resposta.status).toBe(500);
  });
});
