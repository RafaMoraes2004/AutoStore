export interface Carro {
  id: number;
  montadora: string;
  modelo: string;
  categoria: string;
  ano: number;
  motor: string;
  potencia_cv: string;
  cambio: string;
  consumo: string;
  preco_a_partir_rs: number;
  preco_obs: string | null;
  cores: string;
  itens: string;
  desc: string;
  imagem_arquivo: string | null;
  imagens: string[];
  foto_referencia: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Lead {
  id: number;
  nome: string;
  email: string | null;
  telefone: string | null;
  mensagem: string | null;
  carroId: number;
  createdAt: string;
  carro?: Carro;
}

export interface NovoLead {
  nome: string;
  email?: string;
  telefone?: string;
  mensagem?: string;
  carroId: number;
}

export interface FonteChat {
  secao: string;
  slug: string | null;
  carroId: number | null;
  similaridade: number;
}

export interface RespostaChat {
  resposta: string;
  fontes: FonteChat[];
}
