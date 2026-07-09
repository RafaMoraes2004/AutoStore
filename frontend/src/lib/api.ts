import type { Carro, Lead, NovoLead, RespostaChat } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333";

class ApiError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(caminho: string, opcoes?: RequestInit): Promise<T> {
  let resposta: Response;

  try {
    resposta = await fetch(`${API_URL}${caminho}`, {
      ...opcoes,
      headers: {
        "Content-Type": "application/json",
        ...opcoes?.headers,
      },
    });
  } catch {
    throw new ApiError("Não foi possível conectar ao servidor.", 0);
  }

  if (!resposta.ok) {
    let mensagem = "Ocorreu um erro inesperado.";
    try {
      const corpo = (await resposta.json()) as { erro?: string };
      if (corpo.erro) mensagem = corpo.erro;
    } catch {
      // resposta sem corpo JSON
    }
    throw new ApiError(mensagem, resposta.status);
  }

  if (resposta.status === 204) {
    return undefined as T;
  }

  return resposta.json() as Promise<T>;
}

export const api = {
  listarCarros(): Promise<Carro[]> {
    return request<Carro[]>("/carros");
  },

  buscarCarro(id: number): Promise<Carro> {
    return request<Carro>(`/carros/${id}`);
  },

  criarLead(lead: NovoLead): Promise<Lead> {
    return request<Lead>("/leads", {
      method: "POST",
      body: JSON.stringify(lead),
    });
  },

  perguntarAoChat(pergunta: string): Promise<RespostaChat> {
    return request<RespostaChat>("/chat", {
      method: "POST",
      body: JSON.stringify({ pergunta }),
    });
  },
};

export { ApiError };
