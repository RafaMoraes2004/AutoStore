"use client";

export interface EstadoFiltros {
  busca: string;
  categoria: string;
  precoMax: number | null;
}

interface FiltrosProps {
  filtros: EstadoFiltros;
  categorias: string[];
  precoMaximo: number;
  onChange: (filtros: EstadoFiltros) => void;
}

export function Filtros({
  filtros,
  categorias,
  precoMaximo,
  onChange,
}: FiltrosProps) {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 sm:flex-row sm:items-end">
      <div className="flex-1">
        <label
          htmlFor="busca"
          className="mb-1.5 block text-xs font-medium text-[var(--color-text-muted)]"
        >
          Buscar
        </label>
        <input
          id="busca"
          type="text"
          placeholder="Modelo, montadora..."
          value={filtros.busca}
          onChange={(e) => onChange({ ...filtros, busca: e.target.value })}
          className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-base)] px-3 py-2 text-sm outline-none transition-colors focus:border-[var(--color-accent)]"
        />
      </div>

      <div className="sm:w-48">
        <label
          htmlFor="categoria"
          className="mb-1.5 block text-xs font-medium text-[var(--color-text-muted)]"
        >
          Categoria
        </label>
        <select
          id="categoria"
          value={filtros.categoria}
          onChange={(e) => onChange({ ...filtros, categoria: e.target.value })}
          className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-base)] px-3 py-2 text-sm outline-none transition-colors focus:border-[var(--color-accent)]"
        >
          <option value="">Todas</option>
          {categorias.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      <div className="sm:w-56">
        <label
          htmlFor="preco"
          className="mb-1.5 block text-xs font-medium text-[var(--color-text-muted)]"
        >
          Preço até:{" "}
          <span className="text-[var(--color-text)]">
            {filtros.precoMax
              ? filtros.precoMax.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                  maximumFractionDigits: 0,
                })
              : "Sem limite"}
          </span>
        </label>
        <input
          id="preco"
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
      </div>
    </div>
  );
}
