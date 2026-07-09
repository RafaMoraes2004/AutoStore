"use client";

import { useEffect, useMemo, useState } from "react";
import { api, ApiError } from "@/lib/api";
import type { Carro } from "@/lib/types";
import { CarroCard } from "@/components/CarroCard";
import { Filtros, type EstadoFiltros } from "@/components/Filtros";

export default function VitrinePage() {
  const [carros, setCarros] = useState<Carro[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [filtros, setFiltros] = useState<EstadoFiltros>({
    busca: "",
    categoria: "",
    precoMax: null,
  });

  useEffect(() => {
    let ativo = true;
    setCarregando(true);
    setErro(null);

    api
      .listarCarros()
      .then((dados) => {
        if (ativo) setCarros(dados);
      })
      .catch((e) => {
        if (ativo) {
          setErro(
            e instanceof ApiError
              ? e.message
              : "Não foi possível carregar o catálogo."
          );
        }
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });

    return () => {
      ativo = false;
    };
  }, []);

  const categorias = useMemo(
    () => Array.from(new Set(carros.map((c) => c.categoria))).sort(),
    [carros]
  );

  const precoMaximo = useMemo(
    () =>
      carros.length > 0
        ? Math.max(...carros.map((c) => c.preco_a_partir_rs))
        : 300000,
    [carros]
  );

  const carrosFiltrados = useMemo(() => {
    const termo = filtros.busca.trim().toLowerCase();
    return carros.filter((c) => {
      const casaBusca =
        termo === "" ||
        `${c.montadora} ${c.modelo}`.toLowerCase().includes(termo);
      const casaCategoria =
        filtros.categoria === "" || c.categoria === filtros.categoria;
      const casaPreco =
        filtros.precoMax === null || c.preco_a_partir_rs <= filtros.precoMax;
      return casaBusca && casaCategoria && casaPreco;
    });
  }, [carros, filtros]);

  return (
    <div className="flex flex-col gap-8">
      <section className="pt-4">
        <h1 className="font-[family-name:var(--font-display)] text-4xl font-bold tracking-tight sm:text-5xl">
          Encontre seu próximo carro
        </h1>
        <p className="mt-3 max-w-2xl text-[var(--color-text-muted)]">
          Do compacto urbano ao elétrico de alto desempenho. Compare
          especificações, tire dúvidas com nosso assistente e demonstre
          interesse — tudo em um só lugar.
        </p>
      </section>

      <Filtros
        filtros={filtros}
        categorias={categorias}
        precoMaximo={precoMaximo}
        onChange={setFiltros}
      />

      {carregando && <EstadoCarregando />}

      {erro && !carregando && <EstadoErro mensagem={erro} />}

      {!carregando && !erro && carrosFiltrados.length === 0 && <EstadoVazio />}

      {!carregando && !erro && carrosFiltrados.length > 0 && (
        <>
          <p className="text-sm text-[var(--color-text-muted)]">
            {carrosFiltrados.length}{" "}
            {carrosFiltrados.length === 1
              ? "carro encontrado"
              : "carros encontrados"}
          </p>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {carrosFiltrados.map((carro) => (
              <CarroCard key={carro.id} carro={carro} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function EstadoCarregando() {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]"
        >
          <div className="aspect-[16/10] rounded-t-xl bg-[var(--color-surface-2)]" />
          <div className="space-y-3 p-4">
            <div className="h-3 w-1/3 rounded bg-[var(--color-surface-2)]" />
            <div className="h-5 w-2/3 rounded bg-[var(--color-surface-2)]" />
            <div className="h-6 w-1/2 rounded bg-[var(--color-surface-2)]" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EstadoErro({ mensagem }: { mensagem: string }) {
  return (
    <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-8 text-center">
      <p className="font-medium text-red-400">{mensagem}</p>
      <p className="mt-1 text-sm text-[var(--color-text-muted)]">
        Verifique se o servidor está ativo e tente novamente.
      </p>
    </div>
  );
}

function EstadoVazio() {
  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-12 text-center">
      <p className="font-medium">Nenhum carro corresponde aos filtros</p>
      <p className="mt-1 text-sm text-[var(--color-text-muted)]">
        Ajuste a busca, a categoria ou a faixa de preço.
      </p>
    </div>
  );
}
