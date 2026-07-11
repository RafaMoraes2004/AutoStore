import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { SiteHeader } from "@/components/SiteHeader";

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
        <ThemeProvider>
          <SiteHeader />
          <main className="mx-auto max-w-6xl px-5 py-8">{children}</main>
          <footer className="mt-16 border-t border-[var(--color-border)] py-8">
            <p className="mx-auto max-w-6xl px-5 text-sm text-[var(--color-text-muted)]">
              AutoStore · Catálogo de referência 2026 · Preços e especificações
              sujeitos a confirmação.
            </p>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
