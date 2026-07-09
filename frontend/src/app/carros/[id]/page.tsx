"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { api, ApiError } from "@/lib/api";
import type { Carro } from "@/lib/types";
import { formatarPreco } from "@/lib/format";
import { Galeria } from "@/components/Galeria";
import { LeadForm } from "@/components/LeadForm";

export default function DetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const carroId = Number(id);

  const [carro, setCarro] = useState<Carro | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (!Number.isInteger(carroId) || carroId <= 0) {
      setErro("Carro inválido.");
      setCarregando(false);
      return;
    }

    let ativo = true;
    setCarregando(true);
    setErro(null);

    api
      .buscarCarro(carroId)
      .then((dados) => {
        if (ativo) setCarro(dados);
      })
      .catch((e) => {
        if (ativo) {
          setErro(
            e instanceof ApiError && e.status === 404
              ? "Carro não encontrado."
              : "Não foi possível carregar este carro."
          );
        }
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });

    return () => {
      ativo = false;
    };
  }, [carroId]);

  if (carregando) return <DetalheCarregando />;

  if (erro || !carro) {
    return (
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-12 text-center">
        <p className="font-medium">{erro ?? "Carro não encontrado."}</p>
        <Link
          href="/"
          className="mt-4 inline-block text-sm text-[var(--color-accent)] hover:underline"
        >
          ← Voltar ao catálogo
        </Link>
      </div>
    );
  }

  const cores = carro.cores
    .split(",")
    .map((c) => c.trim())
    .filter(Boolean);
  const itens = carro.itens
    .split(",")
    .map((i) => i.trim())
    .filter(Boolean);

  const specs: Array<{ rotulo: string; valor: string }> = [
    { rotulo: "Motor", valor: carro.motor },
    { rotulo: "Potência", valor: `${carro.potencia_cv} cv` },
    { rotulo: "Câmbio", valor: carro.cambio },
    { rotulo: "Consumo", valor: carro.consumo },
    { rotulo: "Ano-modelo", valor: String(carro.ano) },
    { rotulo: "Categoria", valor: carro.categoria },
  ];

  return (
    <div className="flex flex-col gap-8">
      <Link
        href="/"
        className="text-sm text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-text)]"
      >
        ← Voltar ao catálogo
      </Link>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <Galeria
          imagens={carro.imagens}
          imagemPrincipal={carro.imagem_arquivo}
          alt={`${carro.montadora} ${carro.modelo}`}
        />

        <div className="flex flex-col gap-5">
          <div>
            <p className="text-sm uppercase tracking-wider text-[var(--color-text-muted)]">
              {carro.montadora}
            </p>
            <h1 className="font-[family-name:var(--font-display)] text-4xl font-bold tracking-tight">
              {carro.modelo}
            </h1>
          </div>

          <p className="text-[var(--color-text-muted)]">{carro.desc}</p>

          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
            <p className="text-sm text-[var(--color-text-muted)]">
              A partir de
            </p>
            <p className="font-[family-name:var(--font-display)] text-3xl font-bold">
              {formatarPreco(carro.preco_a_partir_rs)}
            </p>
            {carro.preco_obs && (
              <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                {carro.preco_obs}
              </p>
            )}
          </div>

          <div>
            <h2 className="mb-2 text-sm font-medium text-[var(--color-text-muted)]">
              Cores disponíveis
            </h2>
            <div className="flex flex-wrap gap-2">
              {cores.map((cor) => (
                <span
                  key={cor}
                  className="rounded-full border border-[var(--color-border)] px-3 py-1 text-sm"
                >
                  {cor}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <section className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div>
          <h2 className="mb-4 font-[family-name:var(--font-display)] text-xl font-semibold">
            Ficha técnica
          </h2>
          <dl className="divide-y divide-[var(--color-border)] rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]">
            {specs.map((spec) => (
              <div
                key={spec.rotulo}
                className="flex items-start justify-between gap-4 px-4 py-3"
              >
                <dt className="text-sm text-[var(--color-text-muted)]">
                  {spec.rotulo}
                </dt>
                <dd className="text-right text-sm font-medium">{spec.valor}</dd>
              </div>
            ))}
          </dl>

          <h2 className="mb-3 mt-6 font-[family-name:var(--font-display)] text-xl font-semibold">
            Itens e versões
          </h2>
          <ul className="flex flex-col gap-2">
            {itens.map((item) => (
              <li
                key={item}
                className="flex items-start gap-2 text-sm text-[var(--color-text-muted)]"
              >
                <span className="mt-1 text-[var(--color-accent)]">•</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="mb-4 font-[family-name:var(--font-display)] text-xl font-semibold">
            Tenho interesse
          </h2>
          <LeadForm
            carroId={carro.id}
            nomeCarro={`${carro.montadora} ${carro.modelo}`}
          />
        </div>
      </section>
    </div>
  );
}

function DetalheCarregando() {
  return (
    <div className="grid animate-pulse grid-cols-1 gap-8 lg:grid-cols-2">
      <div className="aspect-[16/10] rounded-xl bg-[var(--color-surface-2)]" />
      <div className="flex flex-col gap-4">
        <div className="h-4 w-1/4 rounded bg-[var(--color-surface-2)]" />
        <div className="h-9 w-2/3 rounded bg-[var(--color-surface-2)]" />
        <div className="h-20 rounded bg-[var(--color-surface-2)]" />
        <div className="h-24 rounded bg-[var(--color-surface-2)]" />
      </div>
    </div>
  );
}
