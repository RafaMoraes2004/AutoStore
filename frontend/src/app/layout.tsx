import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "AutoStore — Sua próxima garagem começa aqui",
  description:
    "Catálogo de carros da AutoStore: do compacto urbano ao elétrico premium. Tire dúvidas com nosso assistente e encontre o carro ideal.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body>
        <header className="sticky top-0 z-40 border-b border-[var(--color-border)] bg-[var(--color-base)]/80 backdrop-blur">
          <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
            <Link
              href="/"
              className="font-[family-name:var(--font-display)] text-xl font-bold tracking-tight"
            >
              Auto<span className="text-[var(--color-accent)]">Store</span>
            </Link>
            <div className="flex items-center gap-6 text-sm">
              <Link
                href="/"
                className="text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-text)]"
              >
                Catálogo
              </Link>
              <Link
                href="/chat"
                className="rounded-full bg-[var(--color-accent)] px-4 py-2 font-medium text-white transition-colors hover:bg-[var(--color-accent-hover)]"
              >
                Assistente IA
              </Link>
            </div>
          </nav>
        </header>
        <main className="mx-auto max-w-6xl px-5 py-8">{children}</main>
        <footer className="mt-16 border-t border-[var(--color-border)] py-8">
          <p className="mx-auto max-w-6xl px-5 text-sm text-[var(--color-text-muted)]">
            AutoStore · Catálogo de referência 2026 · Preços e especificações
            sujeitos a confirmação.
          </p>
        </footer>
      </body>
    </html>
  );
}
