"use client";

import { useState } from "react";
import { resolverImagem } from "@/lib/format";

interface GaleriaProps {
  imagens: string[];
  imagemPrincipal: string | null;
  alt: string;
}

export function Galeria({ imagens, imagemPrincipal, alt }: GaleriaProps) {
  const listaFotos =
    imagens.length > 0 ? imagens : imagemPrincipal ? [imagemPrincipal] : [];

  const [ativa, setAtiva] = useState(listaFotos[0] ?? null);

  if (!ativa) {
    return (
      <div className="flex aspect-[16/10] items-center justify-center rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)] text-sm text-[var(--color-text-muted)]">
        Imagem indisponível
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={resolverImagem(ativa)}
          alt={alt}
          className="aspect-[16/10] w-full object-cover"
        />
      </div>

      {listaFotos.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {listaFotos.map((foto) => (
            <button
              key={foto}
              type="button"
              onClick={() => setAtiva(foto)}
              className={`shrink-0 overflow-hidden rounded-lg border-2 transition-colors ${
                foto === ativa
                  ? "border-[var(--color-accent)]"
                  : "border-transparent opacity-60 hover:opacity-100"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={resolverImagem(foto)}
                alt=""
                className="h-16 w-24 object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
