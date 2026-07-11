"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./ThemeToggle";

const LINKS = [
  { href: "/", label: "Catálogo" },
  { href: "/leads", label: "Leads" },
  { href: "/admin/carros", label: "Admin" },
];

export function SiteHeader() {
  const [menuAberto, setMenuAberto] = useState(false);
  const pathname = usePathname();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMenuAberto(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuAberto) return;

    function aoClicarFora(evento: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(evento.target as Node)
      ) {
        setMenuAberto(false);
      }
    }

    function aoPressionarTecla(evento: KeyboardEvent) {
      if (evento.key === "Escape") setMenuAberto(false);
    }

    document.addEventListener("mousedown", aoClicarFora);
    document.addEventListener("keydown", aoPressionarTecla);
    return () => {
      document.removeEventListener("mousedown", aoClicarFora);
      document.removeEventListener("keydown", aoPressionarTecla);
    };
  }, [menuAberto]);

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--color-border)] bg-[var(--color-base)]/80 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <Link
          href="/"
          className="font-[family-name:var(--font-display)] text-xl font-bold tracking-tight"
        >
          Auto<span className="text-[var(--color-accent)]">Store</span>
        </Link>

        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-6 text-sm md:flex">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-text)]"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/chat"
              className="rounded-full bg-[var(--color-accent)] px-4 py-2 font-medium text-white transition-colors hover:bg-[var(--color-accent-hover)]"
            >
              Assistente IA
            </Link>
          </div>

          <ThemeToggle />

          <div ref={menuRef} className="relative md:hidden">
            <button
              type="button"
              onClick={() => setMenuAberto((atual) => !atual)}
              aria-label={menuAberto ? "Fechar menu" : "Abrir menu"}
              aria-expanded={menuAberto}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] transition-colors hover:border-[var(--color-accent)]"
            >
              <svg
                viewBox="0 0 20 20"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
              >
                {menuAberto ? (
                  <path
                    d="M5 5 L15 15 M15 5 L5 15"
                    strokeLinecap="round"
                  />
                ) : (
                  <path
                    d="M3 6 L17 6 M3 10 L17 10 M3 14 L17 14"
                    strokeLinecap="round"
                  />
                )}
              </svg>
            </button>

            {menuAberto && (
              <div className="absolute right-0 top-[calc(100%+0.75rem)] flex w-48 flex-col gap-1 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-2 shadow-xl shadow-black/20">
                {LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="rounded-lg px-3 py-2 text-sm text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text)]"
                  >
                    {link.label}
                  </Link>
                ))}
                <Link
                  href="/chat"
                  className="rounded-lg bg-[var(--color-accent)] px-3 py-2 text-center text-sm font-medium text-white transition-colors hover:bg-[var(--color-accent-hover)]"
                >
                  Assistente IA
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
