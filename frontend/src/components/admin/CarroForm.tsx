"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { api, ApiError } from "@/lib/api";
import type { Carro, NovoCarro } from "@/lib/types";
import {
  VALORES_INICIAIS,
  validarCarro,
  valoresAPartirDoCarro,
  type CarroFormValores,
  type ErrosCarroForm,
} from "@/lib/validarCarro";
import { SelectCustom } from "@/components/SelectCustom";

interface CarroFormProps {
  carroInicial?: Carro;
  rotuloEnviar: string;
  aoSalvar: (dados: NovoCarro) => Promise<void>;
}

export function CarroForm({
  carroInicial,
  rotuloEnviar,
  aoSalvar,
}: CarroFormProps) {
  const [valores, setValores] = useState<CarroFormValores>(
    carroInicial ? valoresAPartirDoCarro(carroInicial) : VALORES_INICIAIS
  );
  const [erros, setErros] = useState<ErrosCarroForm>({});
  const [tentouEnviar, setTentouEnviar] = useState(false);
  const [categorias, setCategorias] = useState<string[]>([]);
  const [categoriaLivre, setCategoriaLivre] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erroEnvio, setErroEnvio] = useState<string | null>(null);

  useEffect(() => {
    let ativo = true;
    api
      .listarCarros()
      .then((carros) => {
        if (!ativo) return;
        const unicas = Array.from(new Set(carros.map((c) => c.categoria))).sort();
        setCategorias(unicas);
      })
      .catch(() => {
        // A lista de categorias é apenas uma conveniência de preenchimento;
        // se falhar, o campo continua editável livremente pelo usuário.
      });
    return () => {
      ativo = false;
    };
  }, []);

  function alterar(campo: keyof CarroFormValores, valor: string) {
    setValores((atual) => ({ ...atual, [campo]: valor }));
  }

  useEffect(() => {
    if (!tentouEnviar) return;
    setErros(validarCarro(valores).erros);
  }, [valores, tentouEnviar]);

  async function aoSubmeter(evento: FormEvent) {
    evento.preventDefault();
    setTentouEnviar(true);
    setErroEnvio(null);

    const resultado = validarCarro(valores);
    setErros(resultado.erros);
    if (!resultado.valido) return;

    setEnviando(true);
    try {
      await aoSalvar(resultado.dados);
    } catch (e) {
      setErroEnvio(
        e instanceof ApiError ? e.message : "Não foi possível salvar. Tente novamente."
      );
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={aoSubmeter} className="flex flex-col gap-6">
      <Secao titulo="Identificação">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Campo
            id="montadora"
            rotulo="Montadora"
            obrigatorio
            valor={valores.montadora}
            onChange={(v) => alterar("montadora", v)}
            erro={erros.montadora}
            placeholder="Toyota"
          />
          <Campo
            id="modelo"
            rotulo="Modelo"
            obrigatorio
            valor={valores.modelo}
            onChange={(v) => alterar("modelo", v)}
            erro={erros.modelo}
            placeholder="Corolla"
          />
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="block text-xs font-medium text-[var(--color-text-muted)]">
                Categoria
                <span className="text-[var(--color-accent)]"> *</span>
              </label>
              <button
                type="button"
                onClick={() => setCategoriaLivre((atual) => !atual)}
                className="text-xs text-[var(--color-accent)] hover:underline"
              >
                {categoriaLivre ? "Escolher da lista" : "+ Nova categoria"}
              </button>
            </div>
            {categoriaLivre ? (
              <input
                autoFocus
                value={valores.categoria}
                onChange={(e) => alterar("categoria", e.target.value)}
                placeholder="Ex.: Conversível"
                className={`w-full rounded-lg border bg-[var(--color-base)] px-3 py-2 text-sm outline-none transition-colors focus:border-[var(--color-accent)] ${
                  erros.categoria
                    ? "border-red-500/60"
                    : "border-[var(--color-border)]"
                }`}
              />
            ) : (
              <SelectCustom
                valor={valores.categoria}
                onChange={(v) => alterar("categoria", v)}
                opcoes={categorias}
                placeholder="Selecione uma categoria"
              />
            )}
            {erros.categoria && (
              <p className="mt-1 text-xs text-red-400">{erros.categoria}</p>
            )}
          </div>
          <Campo
            id="ano"
            rotulo="Ano-modelo"
            obrigatorio
            tipo="number"
            valor={valores.ano}
            onChange={(v) => alterar("ano", v)}
            erro={erros.ano}
            placeholder="2026"
          />
        </div>
      </Secao>

      <Secao titulo="Ficha técnica">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Campo
            id="motor"
            rotulo="Motor"
            obrigatorio
            valor={valores.motor}
            onChange={(v) => alterar("motor", v)}
            erro={erros.motor}
            placeholder="2.0 Flex"
          />
          <Campo
            id="potencia_cv"
            rotulo="Potência (cv)"
            obrigatorio
            valor={valores.potencia_cv}
            onChange={(v) => alterar("potencia_cv", v)}
            erro={erros.potencia_cv}
            placeholder="175"
          />
          <Campo
            id="cambio"
            rotulo="Câmbio"
            obrigatorio
            valor={valores.cambio}
            onChange={(v) => alterar("cambio", v)}
            erro={erros.cambio}
            placeholder="Automático CVT"
          />
          <Campo
            id="consumo"
            rotulo="Consumo"
            obrigatorio
            valor={valores.consumo}
            onChange={(v) => alterar("consumo", v)}
            erro={erros.consumo}
            placeholder="~12 km/l"
          />
        </div>
      </Secao>

      <Secao titulo="Preço">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Campo
            id="preco_a_partir_rs"
            rotulo="Preço a partir de (R$)"
            obrigatorio
            tipo="number"
            valor={valores.preco_a_partir_rs}
            onChange={(v) => alterar("preco_a_partir_rs", v)}
            erro={erros.preco_a_partir_rs}
            placeholder="160000"
          />
          <Campo
            id="preco_obs"
            rotulo="Observação de preço (opcional)"
            valor={valores.preco_obs}
            onChange={(v) => alterar("preco_obs", v)}
            placeholder="referência"
          />
        </div>
      </Secao>

      <Secao titulo="Apresentação">
        <div className="flex flex-col gap-4">
          <Campo
            id="cores"
            rotulo="Cores disponíveis"
            obrigatorio
            valor={valores.cores}
            onChange={(v) => alterar("cores", v)}
            erro={erros.cores}
            placeholder="Branco, Prata, Preto"
          />
          <Campo
            id="itens"
            rotulo="Itens e versões"
            obrigatorio
            textarea
            valor={valores.itens}
            onChange={(v) => alterar("itens", v)}
            erro={erros.itens}
            placeholder="Porta-malas 470 L, multimídia, pacote de assistências"
          />
          <Campo
            id="desc"
            rotulo="Descrição"
            obrigatorio
            textarea
            valor={valores.desc}
            onChange={(v) => alterar("desc", v)}
            erro={erros.desc}
            placeholder="Sedan médio, conforto e eficiência para o dia a dia."
          />
        </div>
      </Secao>

      <Secao titulo="Imagens (opcional)">
        <div className="flex flex-col gap-4">
          <Campo
            id="imagem_arquivo"
            rotulo="Imagem principal"
            valor={valores.imagem_arquivo}
            onChange={(v) => alterar("imagem_arquivo", v)}
            placeholder="imagens/toyota_corolla.jpg"
          />
          <Campo
            id="imagens"
            rotulo="Galeria (um caminho de imagem por linha)"
            textarea
            linhas={4}
            valor={valores.imagens}
            onChange={(v) => alterar("imagens", v)}
            placeholder={"imagens/toyota_corolla.jpg\nimagens/toyota_corolla_02.jpg"}
          />
          <Campo
            id="foto_referencia"
            rotulo="Link de referência da foto"
            valor={valores.foto_referencia}
            onChange={(v) => alterar("foto_referencia", v)}
            placeholder="https://..."
          />
        </div>
      </Secao>

      {erroEnvio && (
        <p className="rounded-lg border border-red-500/30 bg-red-500/5 px-4 py-3 text-sm text-red-400">
          {erroEnvio}
        </p>
      )}

      <div className="flex justify-end gap-3">
        <Link
          href="/admin/carros"
          className="rounded-lg border border-[var(--color-border)] px-4 py-2.5 text-sm font-medium transition-colors hover:bg-[var(--color-surface-2)]"
        >
          Cancelar
        </Link>
        <button
          type="submit"
          disabled={enviando}
          className="rounded-lg bg-[var(--color-accent)] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--color-accent-hover)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {enviando ? "Salvando..." : rotuloEnviar}
        </button>
      </div>
    </form>
  );
}

function Secao({
  titulo,
  children,
}: {
  titulo: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
      <h2 className="mb-4 font-[family-name:var(--font-display)] text-[1rem] font-semibold">
        {titulo}
      </h2>
      {children}
    </div>
  );
}

interface CampoProps {
  id: string;
  rotulo: string;
  valor: string;
  onChange: (v: string) => void;
  erro?: string;
  placeholder?: string;
  tipo?: string;
  obrigatorio?: boolean;
  textarea?: boolean;
  linhas?: number;
}

function Campo({
  id,
  rotulo,
  valor,
  onChange,
  erro,
  placeholder,
  tipo = "text",
  obrigatorio = false,
  textarea = false,
  linhas = 3,
}: CampoProps) {
  const classeBase =
    "w-full rounded-lg border bg-[var(--color-base)] px-3 py-2 text-sm outline-none transition-colors focus:border-[var(--color-accent)]";
  const classeBorda = erro
    ? "border-red-500/60"
    : "border-[var(--color-border)]";

  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1.5 block text-xs font-medium text-[var(--color-text-muted)]"
      >
        {rotulo}
        {obrigatorio && <span className="text-[var(--color-accent)]"> *</span>}
      </label>
      {textarea ? (
        <textarea
          id={id}
          rows={linhas}
          value={valor}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`${classeBase} ${classeBorda} resize-none`}
        />
      ) : (
        <input
          id={id}
          type={tipo}
          value={valor}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`${classeBase} ${classeBorda}`}
        />
      )}
      {erro && <p className="mt-1 text-xs text-red-400">{erro}</p>}
    </div>
  );
}
