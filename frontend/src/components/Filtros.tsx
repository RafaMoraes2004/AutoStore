"use client";

import type { Motorizacao } from "@/lib/format";

export type Ordenacao = "relevancia" | "preco-asc" | "preco-desc";

export interface EstadoFiltros {
  busca: string;
  montadora: string;
  categoria: string;
  motorizacao: string;
  precoMax: number | null;
  ordenacao: Ordenacao;
}

interface FiltrosProps {
  filtros: EstadoFiltros;
  montadoras: string[];
  categorias: string[];
  motorizacoes: Motorizacao[];
  precoMaximo: number;
  onChange: (filtros: EstadoFiltros) => void;
  onLimpar: () => void;
}

export function Filtros({
  filtros,
  montadoras,
  categorias,
  motorizacoes,
  precoMaximo,
  onChange,
  onLimpar,
}: FiltrosProps) {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Campo label="Buscar">
          <input
            type="text"
            placeholder="Modelo, montadora..."
            value={filtros.busca}
            onChange={(e) => onChange({ ...filtros, busca: e.target.value })}
            className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-base)] px-3 py-2 text-sm outline-none transition-colors focus:border-[var(--color-accent)]"
          />
        </Campo>

        <Campo label="Montadora">
          <Select
            valor={filtros.montadora}
            onChange={(v) => onChange({ ...filtros, montadora: v })}
            opcoes={montadoras}
            placeholder="Todas"
          />
        </Campo>

        <Campo label="Categoria">
          <Select
            valor={filtros.categoria}
            onChange={(v) => onChange({ ...filtros, categoria: v })}
            opcoes={categorias}
            placeholder="Todas"
          />
        </Campo>

        <Campo label="Motorização">
          <Select
            valor={filtros.motorizacao}
            onChange={(v) => onChange({ ...filtros, motorizacao: v })}
            opcoes={motorizacoes}
            placeholder="Todas"
          />
        </Campo>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Campo
          label={`Preço até: ${
            filtros.precoMax
              ? filtros.precoMax.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                  maximumFractionDigits: 0,
                })
              : "Sem limite"
          }`}
        >
          <input
            type="range"
            min={0}
            max={precoMaximo}
            step={5000}
            value={filtros.precoMax ?? precoMaximo}
            onChange={(e) => {
              const valor = Number(e.target.value);
              onChange({
                ...filtros,
                precoMax: valor >= precoMaximo ? null : valor,
              });
            }}
            className="w-full accent-[var(--color-accent)]"
          />
        </Campo>

        <Campo label="Ordenar por">
          <div className="flex gap-2">
            <OrdBtn
              ativo={filtros.ordenacao === "relevancia"}
              onClick={() => onChange({ ...filtros, ordenacao: "relevancia" })}
            >
              Padrão
            </OrdBtn>
            <OrdBtn
              ativo={filtros.ordenacao === "preco-asc"}
              onClick={() => onChange({ ...filtros, ordenacao: "preco-asc" })}
            >
              Menor preço
            </OrdBtn>
            <OrdBtn
              ativo={filtros.ordenacao === "preco-desc"}
              onClick={() => onChange({ ...filtros, ordenacao: "preco-desc" })}
            >
              Maior preço
            </OrdBtn>
          </div>
        </Campo>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={onLimpar}
          className="text-xs text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-text)]"
        >
          Limpar filtros
        </button>
      </div>
    </div>
  );
}

function Campo({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-[var(--color-text-muted)]">
        {label}
      </label>
      {children}
    </div>
  );
}

function Select({
  valor,
  onChange,
  opcoes,
  placeholder,
}: {
  valor: string;
  onChange: (v: string) => void;
  opcoes: string[];
  placeholder: string;
}) {
  return (
    <select
      value={valor}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-base)] px-3 py-2 text-sm outline-none transition-colors focus:border-[var(--color-accent)]"
    >
      <option value="">{placeholder}</option>
      {opcoes.map((op) => (
        <option key={op} value={op}>
          {op}
        </option>
      ))}
    </select>
  );
}

function OrdBtn({
  ativo,
  onClick,
  children,
}: {
  ativo: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 rounded-lg border px-2 py-2 text-xs font-medium transition-colors ${
        ativo
          ? "border-[var(--color-accent)] bg-[var(--color-accent)]/10 text-[var(--color-text)]"
          : "border-[var(--color-border)] bg-[var(--color-base)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
      }`}
    >
      {children}
    </button>
  );
}
