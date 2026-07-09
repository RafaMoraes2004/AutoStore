const GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta";
const EMBEDDING_MODEL = "gemini-embedding-001";
const GENERATION_MODEL = "gemini-3.1-flash-lite";
export const EMBEDDING_DIMENSIONS = 768;

type TaskType = "RETRIEVAL_DOCUMENT" | "RETRIEVAL_QUERY";

function getApiKey(): string {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    throw new Error("GEMINI_API_KEY não configurada no ambiente.");
  }
  return key;
}

function pausa(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchComRetry(
  url: string,
  opcoes: RequestInit,
  tentativas = 5
): Promise<Response> {
  let ultimoErro = "";

  for (let tentativa = 1; tentativa <= tentativas; tentativa += 1) {
    const resposta = await fetch(url, opcoes);

    if (resposta.ok) return resposta;

    if (resposta.status === 429) {
      const esperaMs = Math.min(2000 * tentativa, 10000);
      ultimoErro = await resposta.text();
      await pausa(esperaMs);
      continue;
    }

    const detalhe = await resposta.text();
    throw new Error(`Erro na API Gemini (${resposta.status}): ${detalhe}`);
  }

  throw new Error(
    `Rate limit persistente após ${tentativas} tentativas: ${ultimoErro}`
  );
}

function normalizar(vetor: number[]): number[] {
  const magnitude = Math.sqrt(vetor.reduce((soma, v) => soma + v * v, 0));
  if (magnitude === 0) return vetor;
  return vetor.map((v) => v / magnitude);
}

export async function gerarEmbedding(
  texto: string,
  taskType: TaskType
): Promise<number[]> {
  const url = `${GEMINI_BASE}/models/${EMBEDDING_MODEL}:embedContent`;

  const resposta = await fetchComRetry(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": getApiKey(),
    },
    body: JSON.stringify({
      model: `models/${EMBEDDING_MODEL}`,
      content: { parts: [{ text: texto }] },
      taskType,
      outputDimensionality: EMBEDDING_DIMENSIONS,
    }),
  });

  const dados = (await resposta.json()) as {
    embedding?: { values?: number[] };
  };
  const valores = dados.embedding?.values;

  if (!valores || valores.length !== EMBEDDING_DIMENSIONS) {
    throw new Error(
      `Embedding retornado com dimensão inesperada: ${
        valores?.length ?? "nenhuma"
      }.`
    );
  }

  return normalizar(valores);
}

export async function gerarResposta(prompt: string): Promise<string> {
  const url = `${GEMINI_BASE}/models/${GENERATION_MODEL}:generateContent`;

  const resposta = await fetchComRetry(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": getApiKey(),
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 800,
      },
    }),
  });

  const dados = (await resposta.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };

  const texto = dados.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!texto) {
    throw new Error("A API de geração não retornou texto.");
  }

  return texto.trim();
}
