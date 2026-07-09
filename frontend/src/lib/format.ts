export function formatarPreco(valor: number): string {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  });
}

const IMAGEM_FALLBACK = "/imagens/_placeholder.svg";

export function resolverImagem(caminho: string | null): string {
  if (!caminho) return IMAGEM_FALLBACK;
  const limpo = caminho.startsWith("/") ? caminho : `/${caminho}`;
  return limpo;
}

export type Motorizacao = "Elétrico" | "Híbrido" | "Diesel" | "Combustão";

export function inferirMotorizacao(motor: string): Motorizacao {
  const texto = motor.toLowerCase();
  if (texto.includes("elétric") || texto.includes("eletric")) return "Elétrico";
  if (texto.includes("híbrid") || texto.includes("hibrid")) return "Híbrido";
  if (texto.includes("diesel")) return "Diesel";
  return "Combustão";
}
