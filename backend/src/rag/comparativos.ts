import * as fs from "node:fs";
import type { Chunk } from "./chunking.js";

interface VeiculoEnriquecido {
  id: number;
  slug: string;
  montadora: string;
  modelo: string;
  categoria: string;
  preco_a_partir_rs: number;
  motor: string;
  normalized?: {
    body_type?: string;
    powertrain_type?: string;
    fuel_type?: string;
  };
}

function formatarPreco(valor: number): string {
  return `R$ ${valor.toLocaleString("pt-BR")}`;
}

export function gerarChunksComparativos(jsonPath: string): Chunk[] {
  const raw = fs.readFileSync(jsonPath, "utf-8");
  const data = JSON.parse(raw) as { vehicles: VeiculoEnriquecido[] };
  const veiculos = data.vehicles;

  const chunks: Chunk[] = [];
  const push = (secao: string, linhas: string[]) => {
    const conteudo = `${secao}\n${linhas.join("\n")}`;
    chunks.push({ slug: null, carroId: null, secao, conteudo });
  };

  const ordenadosPorPreco = [...veiculos].sort(
    (a, b) => a.preco_a_partir_rs - b.preco_a_partir_rs
  );
  const maisBarato = ordenadosPorPreco[0]!;
  const maisCaro = ordenadosPorPreco[ordenadosPorPreco.length - 1]!;

  push("Comparativo — Preços do catálogo", [
    `Carro mais barato: ${maisBarato.montadora} ${
      maisBarato.modelo
    }, a partir de ${formatarPreco(maisBarato.preco_a_partir_rs)}.`,
    `Carro mais caro: ${maisCaro.montadora} ${
      maisCaro.modelo
    }, a partir de ${formatarPreco(maisCaro.preco_a_partir_rs)}.`,
    "Ordem crescente de preço:",
    ...ordenadosPorPreco.map(
      (v) =>
        `- ${v.montadora} ${v.modelo}: ${formatarPreco(v.preco_a_partir_rs)}`
    ),
  ]);

  const porCategoria = new Map<string, VeiculoEnriquecido[]>();
  for (const v of veiculos) {
    const cat = v.categoria;
    if (!porCategoria.has(cat)) porCategoria.set(cat, []);
    porCategoria.get(cat)!.push(v);
  }
  for (const [categoria, lista] of porCategoria) {
    push(`Comparativo — Categoria ${categoria}`, [
      `Modelos na categoria ${categoria}:`,
      ...lista.map(
        (v) =>
          `- ${v.montadora} ${v.modelo} (${formatarPreco(v.preco_a_partir_rs)})`
      ),
    ]);
  }

  const eletricos = veiculos.filter(
    (v) =>
      v.normalized?.powertrain_type === "electric" ||
      /elétric/i.test(v.categoria)
  );
  if (eletricos.length > 0) {
    push("Comparativo — Carros 100% elétricos", [
      "Modelos totalmente elétricos do catálogo:",
      ...eletricos.map((v) => `- ${v.montadora} ${v.modelo} (${v.categoria})`),
    ]);
  }

  const montadoras = new Map<string, VeiculoEnriquecido[]>();
  for (const v of veiculos) {
    if (!montadoras.has(v.montadora)) montadoras.set(v.montadora, []);
    montadoras.get(v.montadora)!.push(v);
  }
  for (const [montadora, lista] of montadoras) {
    push(`Comparativo — Modelos da ${montadora}`, [
      `Modelos da ${montadora} no catálogo:`,
      ...lista.map((v) => `- ${v.modelo} (${v.categoria})`),
    ]);
  }

  const diesel = veiculos.filter((v) => /diesel/i.test(v.motor));
  if (diesel.length > 0) {
    push("Comparativo — Carros a diesel", [
      "Modelos com motor diesel:",
      ...diesel.map((v) => `- ${v.montadora} ${v.modelo}`),
    ]);
  }

  return chunks;
}
