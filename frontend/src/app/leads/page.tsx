"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api, ApiError } from "@/lib/api";
import type { Lead } from "@/lib/types";
import { formatarPreco } from "@/lib/format";

function formatarData(iso: string): string {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    let ativo = true;
    setCarregando(true);
    setErro(null);

    api
      .listarLeads()
      .then((dados) => {
        if (ativo) setLeads(dados);
      })
      .catch((e) => {
        if (ativo) {
          setErro(
            e instanceof ApiError
              ? e.message
              : "Não foi possível carregar os leads."
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

  return (
    <div className="flex flex-col gap-6">
      <section className="pt-4">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight sm:text-4xl">
          Leads recebidos
        </h1>
        <p className="mt-2 text-[var(--color-text-muted)]">
          Clientes que demonstraram interesse pelos veículos do catálogo.
        </p>
      </section>

      {carregando && <LeadsCarregando />}

      {erro && !carregando && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-8 text-center">
          <p className="font-medium text-red-400">{erro}</p>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">
            Verifique se o servidor está ativo e tente novamente.
          </p>
        </div>
      )}

      {!carregando && !erro && leads.length === 0 && (
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-12 text-center">
          <p className="font-medium">Nenhum lead ainda</p>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">
            Quando um cliente demonstrar interesse por um carro, ele aparece
            aqui.
          </p>
        </div>
      )}

      {!carregando && !erro && leads.length > 0 && (
        <>
          <p className="text-sm text-[var(--color-text-muted)]">
            {leads.length} {leads.length === 1 ? "lead" : "leads"}
          </p>
          <div className="flex flex-col gap-3">
            {leads.map((lead) => (
              <LeadCard key={lead.id} lead={lead} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function LeadCard({ lead }: { lead: Lead }) {
  return (
    <div
      data-testid="lead-card"
      className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-2">
          <div>
            <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold">
              {lead.nome}
            </h2>
            <p className="text-xs text-[var(--color-text-muted)]">
              {formatarData(lead.createdAt)}
            </p>
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
            {lead.email && (
              <a
                href={`mailto:${lead.email}`}
                className="text-[var(--color-accent)] hover:underline"
              >
                {lead.email}
              </a>
            )}
            {lead.telefone && (
              <a
                href={`tel:${lead.telefone.replace(/\D/g, "")}`}
                className="text-[var(--color-accent)] hover:underline"
              >
                {lead.telefone}
              </a>
            )}
          </div>

          {lead.mensagem && (
            <p className="mt-1 max-w-xl text-sm text-[var(--color-text-muted)]">
              “{lead.mensagem}”
            </p>
          )}
        </div>

        {lead.carro && (
          <Link
            href={`/carros/${lead.carro.id}`}
            className="shrink-0 rounded-lg border border-[var(--color-border)] bg-[var(--color-base)] px-4 py-3 transition-colors hover:border-[var(--color-accent)]"
          >
            <p className="text-xs uppercase tracking-wider text-[var(--color-text-muted)]">
              Interesse em
            </p>
            <p className="font-medium">
              {lead.carro.montadora} {lead.carro.modelo}
            </p>
            <p className="text-sm text-[var(--color-text-muted)]">
              {formatarPreco(lead.carro.preco_a_partir_rs)}
            </p>
          </Link>
        )}
      </div>
    </div>
  );
}

function LeadsCarregando() {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5"
        >
          <div className="flex justify-between gap-4">
            <div className="flex-1 space-y-2">
              <div className="h-5 w-1/3 rounded bg-[var(--color-surface-2)]" />
              <div className="h-3 w-1/4 rounded bg-[var(--color-surface-2)]" />
              <div className="h-4 w-1/2 rounded bg-[var(--color-surface-2)]" />
            </div>
            <div className="h-16 w-40 rounded bg-[var(--color-surface-2)]" />
          </div>
        </div>
      ))}
    </div>
  );
}
