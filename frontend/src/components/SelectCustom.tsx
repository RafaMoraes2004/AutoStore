"use client";

import { useEffect, useRef, useState } from "react";

interface SelectCustomProps {
  valor: string;
  onChange: (v: string) => void;
  opcoes: string[];
  placeholder: string;
}

export function SelectCustom({
  valor,
  onChange,
  opcoes,
  placeholder,
}: SelectCustomProps) {
  const [aberto, setAberto] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!aberto) return;

    function aoClicarFora(evento: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(evento.target as Node)
      ) {
        setAberto(false);
      }
    }

    function aoPressionarTecla(evento: KeyboardEvent) {
      if (evento.key === "Escape") setAberto(false);
    }

    document.addEventListener("mousedown", aoClicarFora);
    document.addEventListener("keydown", aoPressionarTecla);
    return () => {
      document.removeEventListener("mousedown", aoClicarFora);
      document.removeEventListener("keydown", aoPressionarTecla);
    };
  }, [aberto]);

  function selecionar(opcao: string) {
    onChange(opcao);
    setAberto(false);
  }

  const rotulo = valor || placeholder;

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setAberto((a) => !a)}
        aria-haspopup="listbox"
        aria-expanded={aberto}
        className="flex w-full items-center justify-between gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-base)] px-3 py-2 text-left text-sm outline-none transition-colors hover:border-[var(--color-accent)] focus:border-[var(--color-accent)]"
      >
        <span className={valor ? "" : "text-[var(--color-text-muted)]"}>
          {rotulo}
        </span>
        <svg
          viewBox="0 0 20 20"
          className={`h-4 w-4 shrink-0 text-[var(--color-text-muted)] transition-transform duration-200 ${
            aberto ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
        >
          <path
            d="M5 7.5 L10 12.5 L15 7.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {aberto && (
        <ul
          role="listbox"
          className="absolute z-50 mt-1.5 max-h-60 w-full overflow-auto rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-1 shadow-xl shadow-black/20"
        >
          <li role="option" aria-selected={valor === ""}>
            <button
              type="button"
              onClick={() => selecionar("")}
              className={`w-full rounded-md px-3 py-2 text-left text-sm transition-colors ${
                valor === ""
                  ? "bg-[var(--color-accent)]/10 text-[var(--color-accent)]"
                  : "hover:bg-[var(--color-surface-2)]"
              }`}
            >
              {placeholder}
            </button>
          </li>
          {opcoes.map((opcao) => (
            <li key={opcao} role="option" aria-selected={valor === opcao}>
              <button
                type="button"
                onClick={() => selecionar(opcao)}
                className={`w-full rounded-md px-3 py-2 text-left text-sm transition-colors ${
                  valor === opcao
                    ? "bg-[var(--color-accent)]/10 text-[var(--color-accent)]"
                    : "hover:bg-[var(--color-surface-2)]"
                }`}
              >
                {opcao}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
