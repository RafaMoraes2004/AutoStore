import * as fs from "node:fs";

export interface Chunk {
  slug: string | null;
  carroId: number | null;
  secao: string;
  conteudo: string;
}

interface CarroRef {
  id: number;
  slug: string;
  nome: string;
}

function construirMapaDeCarros(jsonPath: string): Map<string, CarroRef> {
  const raw = fs.readFileSync(jsonPath, "utf-8");
  const data = JSON.parse(raw) as {
    vehicles: Array<{
      id: number;
      slug: string;
      montadora: string;
      modelo: string;
    }>;
  };

  const mapa = new Map<string, CarroRef>();
  for (const v of data.vehicles) {
    const nome = `${v.montadora} ${v.modelo}`;
    mapa.set(nome.toLowerCase(), { id: v.id, slug: v.slug, nome });
  }
  return mapa;
}

export function gerarChunks(markdownPath: string, jsonPath: string): Chunk[] {
  const mapaCarros = construirMapaDeCarros(jsonPath);
  const linhas = fs.readFileSync(markdownPath, "utf-8").split("\n");

  const chunks: Chunk[] = [];

  let carroAtual: CarroRef | null = null;
  let secaoAtual: string | null = null;
  let buffer: string[] = [];

  const flush = () => {
    const conteudo = buffer.join("\n").trim();
    buffer = [];
    if (!conteudo || secaoAtual === null) return;

    const nomeCarro = carroAtual?.nome ?? "Base de conhecimento";
    const rotuloSecao = `${nomeCarro} — ${secaoAtual}`;

    chunks.push({
      slug: carroAtual?.slug ?? null,
      carroId: carroAtual?.id ?? null,
      secao: rotuloSecao,
      conteudo: `${rotuloSecao}\n${conteudo}`,
    });
  };

  for (const linha of linhas) {
    const h2 = linha.match(/^##\s+(.+?)\s*$/);
    const h3 = linha.match(/^###\s+(.+?)\s*$/);

    if (h2) {
      flush();
      const titulo = h2[1]!.trim();
      const ref = mapaCarros.get(titulo.toLowerCase());
      carroAtual = ref ?? null;
      secaoAtual = ref ? null : titulo;
      continue;
    }

    if (h3) {
      flush();
      secaoAtual = h3[1]!.trim();
      continue;
    }

    buffer.push(linha);
  }

  flush();

  return chunks;
}
