import type { MensagemHistorico } from "./geracao.js";

const LIMITE_HISTORICO = 6;
const LIMITE_TAMANHO_MENSAGEM = 2000;
const LIMITE_TAMANHO_FOLLOW_UP = 40;
const PADRAO_FOLLOW_UP =
  /\b(ele|dele|nele|esse|este|isso|mais detalhes|e o|e a|também)\b/i;

export function validarHistorico(historico: unknown): MensagemHistorico[] {
  if (!Array.isArray(historico)) return [];

  return historico
    .filter(
      (m): m is MensagemHistorico =>
        m !== null &&
        typeof m === "object" &&
        (m.autor === "usuario" || m.autor === "assistente") &&
        typeof m.texto === "string" &&
        m.texto.trim().length > 0 &&
        m.texto.trim().length <= LIMITE_TAMANHO_MENSAGEM
    )
    .slice(-LIMITE_HISTORICO);
}

export function construirQueryBusca(
  pergunta: string,
  historicoValidado: MensagemHistorico[]
): string {
  const ultimaPerguntaUsuario = [...historicoValidado]
    .reverse()
    .find((m) => m.autor === "usuario");

  const textoPergunta = pergunta.trim();
  const ehFollowUp =
    textoPergunta.length < LIMITE_TAMANHO_FOLLOW_UP ||
    PADRAO_FOLLOW_UP.test(textoPergunta);

  return ehFollowUp && ultimaPerguntaUsuario
    ? `${ultimaPerguntaUsuario.texto} ${textoPergunta}`
    : textoPergunta;
}
