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
