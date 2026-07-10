import type { Carro, NovoCarro } from "./types";

export const ANO_MINIMO = 1980;
export const ANO_MAXIMO = 2100;

export interface CarroFormValores {
  montadora: string;
  modelo: string;
  categoria: string;
  ano: string;
  motor: string;
  potencia_cv: string;
  cambio: string;
  consumo: string;
  preco_a_partir_rs: string;
  preco_obs: string;
  cores: string;
  itens: string;
  desc: string;
  imagem_arquivo: string;
  imagens: string;
  foto_referencia: string;
}

export type ErrosCarroForm = Partial<Record<keyof CarroFormValores, string>>;

const CAMPOS_TEXTO_OBRIGATORIOS: Array<keyof CarroFormValores> = [
  "montadora",
  "modelo",
  "categoria",
  "motor",
  "potencia_cv",
  "cambio",
  "consumo",
  "cores",
  "itens",
  "desc",
];

export const VALORES_INICIAIS: CarroFormValores = {
  montadora: "",
  modelo: "",
  categoria: "",
  ano: "",
  motor: "",
  potencia_cv: "",
  cambio: "",
  consumo: "",
  preco_a_partir_rs: "",
  preco_obs: "",
  cores: "",
  itens: "",
  desc: "",
  imagem_arquivo: "",
  imagens: "",
  foto_referencia: "",
};

export function valoresAPartirDoCarro(carro: Carro): CarroFormValores {
  return {
    montadora: carro.montadora,
    modelo: carro.modelo,
    categoria: carro.categoria,
    ano: String(carro.ano),
    motor: carro.motor,
    potencia_cv: carro.potencia_cv,
    cambio: carro.cambio,
    consumo: carro.consumo,
    preco_a_partir_rs: String(carro.preco_a_partir_rs),
    preco_obs: carro.preco_obs ?? "",
    cores: carro.cores,
    itens: carro.itens,
    desc: carro.desc,
    imagem_arquivo: carro.imagem_arquivo ?? "",
    imagens: carro.imagens.join("\n"),
    foto_referencia: carro.foto_referencia ?? "",
  };
}

export interface ResultadoValidacaoCarro {
  valido: boolean;
  erros: ErrosCarroForm;
  dados: NovoCarro;
}

export function validarCarro(
  valores: CarroFormValores
): ResultadoValidacaoCarro {
  const erros: ErrosCarroForm = {};

  for (const campo of CAMPOS_TEXTO_OBRIGATORIOS) {
    if (valores[campo].trim().length === 0) {
      erros[campo] = "Campo obrigatório.";
    }
  }

  const anoNumero = Number(valores.ano);
  const anoValido =
    valores.ano.trim().length > 0 &&
    Number.isInteger(anoNumero) &&
    anoNumero >= ANO_MINIMO &&
    anoNumero <= ANO_MAXIMO;
  if (!anoValido) {
    erros.ano = `Informe um ano entre ${ANO_MINIMO} e ${ANO_MAXIMO}.`;
  }

  const precoNumero = Number(valores.preco_a_partir_rs);
  const precoValido =
    valores.preco_a_partir_rs.trim().length > 0 &&
    Number.isInteger(precoNumero) &&
    precoNumero >= 0;
  if (!precoValido) {
    erros.preco_a_partir_rs =
      "Informe um preço inteiro (sem centavos), maior ou igual a zero.";
  }

  const dados: NovoCarro = {
    montadora: valores.montadora.trim(),
    modelo: valores.modelo.trim(),
    categoria: valores.categoria.trim(),
    ano: anoValido ? anoNumero : 0,
    motor: valores.motor.trim(),
    potencia_cv: valores.potencia_cv.trim(),
    cambio: valores.cambio.trim(),
    consumo: valores.consumo.trim(),
    preco_a_partir_rs: precoValido ? precoNumero : 0,
    preco_obs: valores.preco_obs.trim() || null,
    cores: valores.cores.trim(),
    itens: valores.itens.trim(),
    desc: valores.desc.trim(),
    imagem_arquivo: valores.imagem_arquivo.trim() || null,
    imagens: valores.imagens
      .split("\n")
      .map((linha) => linha.trim())
      .filter(Boolean),
    foto_referencia: valores.foto_referencia.trim() || null,
  };

  return { valido: Object.keys(erros).length === 0, erros, dados };
}
