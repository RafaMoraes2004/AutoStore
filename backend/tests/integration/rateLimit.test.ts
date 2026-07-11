import { describe, expect, it, vi } from "vitest";
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

describe("Rate limiting em POST /chat", () => {
  it("bloqueia com 429 após exceder o limite de requisições por minuto", async () => {
    mockBuscarChunksRelevantes.mockResolvedValue([]);
    mockResponderComContexto.mockResolvedValue("Resposta de teste.");

    const respostas = [];
    for (let i = 0; i < 11; i += 1) {
      respostas.push(
        await request(app).post("/chat").send({ pergunta: `pergunta ${i}` })
      );
    }

    const bloqueadas = respostas.filter((r) => r.status === 429);
    expect(bloqueadas.length).toBeGreaterThan(0);
    expect(respostas[10]?.status).toBe(429);
    expect(respostas[10]?.body).toEqual({
      erro: "Muitas perguntas em pouco tempo. Aguarde um instante e tente novamente.",
    });
  });
});
