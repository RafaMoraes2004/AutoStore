export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const TELEFONE_REGEX = /^[\d\s()+-]{8,20}$/;

export interface LeadPayload {
  nome?: string;
  email?: string;
  telefone?: string;
  mensagem?: string;
  carroId?: number | string;
}

export interface CarroPayload {
  montadora?: unknown;
  modelo?: unknown;
  categoria?: unknown;
  ano?: unknown;
  motor?: unknown;
  potencia_cv?: unknown;
  cambio?: unknown;
  consumo?: unknown;
  preco_a_partir_rs?: unknown;
  preco_obs?: unknown;
  cores?: unknown;
  itens?: unknown;
  desc?: unknown;
  imagem_arquivo?: unknown;
  imagens?: unknown;
  foto_referencia?: unknown;
}

export function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export function isValidAno(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isInteger(value) &&
    value >= 1980 &&
    value <= 2100
  );
}

export function isValidPreco(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 0;
}

export function isStringArray(value: unknown): value is string[] {
  return (
    Array.isArray(value) && value.every((item) => typeof item === "string")
  );
}

export const CARRO_CAMPOS_OBRIGATORIOS: Record<
  string,
  (value: unknown) => boolean
> = {
  montadora: isNonEmptyString,
  modelo: isNonEmptyString,
  categoria: isNonEmptyString,
  ano: isValidAno,
  motor: isNonEmptyString,
  potencia_cv: isNonEmptyString,
  cambio: isNonEmptyString,
  consumo: isNonEmptyString,
  preco_a_partir_rs: isValidPreco,
  cores: isNonEmptyString,
  itens: isNonEmptyString,
  desc: isNonEmptyString,
};

export const CARRO_CAMPOS_OPCIONAIS_NULLABLE = [
  "preco_obs",
  "imagem_arquivo",
  "foto_referencia",
] as const;

export const CARRO_CAMPOS_ATUALIZAVEIS = new Set([
  ...Object.keys(CARRO_CAMPOS_OBRIGATORIOS),
  ...CARRO_CAMPOS_OPCIONAIS_NULLABLE,
  "imagens",
]);

export function parseId(rawId: string | string[] | undefined): number | null {
  if (typeof rawId !== "string") return null;
  const id = Number(rawId);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export interface ResultadoValidacaoLead {
  valido: boolean;
  carroId: number;
}

export function validarLead(payload: LeadPayload): ResultadoValidacaoLead {
  const { nome, email, telefone, mensagem, carroId } = payload;

  const nomeValido =
    typeof nome === "string" &&
    nome.trim().length > 0 &&
    nome.trim().length <= 120;
  const emailValido =
    typeof email === "string" && email.trim().length > 0
      ? EMAIL_REGEX.test(email.trim())
      : false;
  const telefoneValido =
    typeof telefone === "string" && telefone.trim().length > 0
      ? TELEFONE_REGEX.test(telefone.trim())
      : false;
  const contatoValido = emailValido || telefoneValido;
  const carroIdNumero = Number(carroId);
  const carroIdValido =
    carroId !== undefined &&
    Number.isInteger(carroIdNumero) &&
    carroIdNumero > 0;
  const mensagemValida =
    mensagem === undefined ||
    (typeof mensagem === "string" && mensagem.trim().length <= 1000);

  return {
    valido: nomeValido && contatoValido && carroIdValido && mensagemValida,
    carroId: carroIdNumero,
  };
}
