import type {
  Carro,
  Lead,
  NovoCarro,
  NovoLead,
  RespostaChat,
  MensagemHistorico,
} from "./types";

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

  criarCarro(carro: NovoCarro): Promise<Carro> {
    return request<Carro>("/carros", {
      method: "POST",
      body: JSON.stringify(carro),
    });
  },

  atualizarCarro(id: number, dados: Partial<NovoCarro>): Promise<Carro> {
    return request<Carro>(`/carros/${id}`, {
      method: "PATCH",
      body: JSON.stringify(dados),
    });
  },

  removerCarro(id: number): Promise<void> {
    return request<void>(`/carros/${id}`, {
      method: "DELETE",
    });
  },

  criarLead(lead: NovoLead): Promise<Lead> {
    return request<Lead>("/leads", {
      method: "POST",
      body: JSON.stringify(lead),
    });
  },

  listarLeads(): Promise<Lead[]> {
    return request<Lead[]>("/leads");
  },

  perguntarAoChat(
    pergunta: string,
    historico: MensagemHistorico[] = []
  ): Promise<RespostaChat> {
    return request<RespostaChat>("/chat", {
      method: "POST",
      body: JSON.stringify({ pergunta, historico }),
    });
  },
};

export { ApiError };
