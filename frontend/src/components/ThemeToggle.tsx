"use client";

import { useTema } from "./ThemeProvider";

export function ThemeToggle() {
  const { tema, alternar } = useTema();
  const claro = tema === "light";

  return (
    <button
      type="button"
      onClick={alternar}
      aria-label={claro ? "Ativar modo noturno" : "Ativar modo diurno"}
      title={claro ? "Modo noturno" : "Modo diurno"}
      className="group relative flex h-9 w-9 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] transition-colors hover:border-[var(--color-accent)]"
    >
      <svg
        viewBox="0 0 24 24"
        className="h-5 w-5"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Facho de luz — visível apenas no modo claro (farol aceso) */}
        <g
          className={`origin-left transition-opacity duration-300 ${
            claro ? "opacity-100" : "opacity-0"
          }`}
        >
          <path
            d="M15 8.5 L22 5.5"
            stroke="var(--color-accent)"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M15 12 L23 12"
            stroke="var(--color-accent)"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M15 15.5 L22 18.5"
            stroke="var(--color-accent)"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </g>

        {/* Corpo do farol */}
        <path
          d="M3 7 C3 6 3.5 5.5 5 5.5 L9 5.5 C12.5 5.5 15 8 15 12 C15 16 12.5 18.5 9 18.5 L5 18.5 C3.5 18.5 3 18 3 17 Z"
          fill={claro ? "var(--color-accent)" : "none"}
          stroke="var(--color-text)"
          strokeWidth="1.5"
          strokeLinejoin="round"
          className="transition-all duration-300"
        />

        {/* Lente do farol */}
        <ellipse
          cx="9"
          cy="12"
          rx="2.5"
          ry="4"
          fill={claro ? "var(--color-base)" : "var(--color-text-muted)"}
          className="transition-all duration-300"
        />
      </svg>
    </button>
  );
}
