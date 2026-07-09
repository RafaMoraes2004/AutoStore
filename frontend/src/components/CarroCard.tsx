import Link from "next/link";
import type { Carro } from "@/lib/types";
import { formatarPreco, resolverImagem } from "@/lib/format";

export function CarroCard({ carro }: { carro: Carro }) {
  return (
    <Link
      href={`/carros/${carro.id}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] transition-all hover:border-[var(--color-accent)] hover:shadow-lg hover:shadow-[var(--color-accent)]/10"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-[var(--color-surface-2)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={resolverImagem(carro.imagem_arquivo)}
          alt={`${carro.montadora} ${carro.modelo}`}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <span className="absolute left-3 top-3 rounded-full bg-[var(--color-base)]/80 px-3 py-1 text-xs font-medium text-[var(--color-text-muted)] backdrop-blur">
          {carro.categoria}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <p className="text-xs uppercase tracking-wider text-[var(--color-text-muted)]">
            {carro.montadora}
          </p>
          <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold">
            {carro.modelo}
          </h3>
        </div>

        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[var(--color-text-muted)]">
          <span>{carro.ano}</span>
          <span>{carro.potencia_cv} cv</span>
          <span>{carro.cambio}</span>
        </div>

        <div className="mt-auto pt-2">
          <p className="text-xs text-[var(--color-text-muted)]">A partir de</p>
          <p className="font-[family-name:var(--font-display)] text-xl font-bold text-[var(--color-text)]">
            {formatarPreco(carro.preco_a_partir_rs)}
          </p>
        </div>
      </div>
    </Link>
  );
}
