"use client";

// ATENÇÃO: sem autenticação — ver nota em /admin/carros/page.tsx.

import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import type { NovoCarro } from "@/lib/types";
import { CarroForm } from "@/components/admin/CarroForm";

export default function NovoCarroPage() {
  const router = useRouter();

  async function salvar(dados: NovoCarro) {
    await api.criarCarro(dados);
    router.push("/admin/carros?sucesso=criado");
  }

  return (
    <div className="flex flex-col gap-6">
      <section className="pt-4">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight sm:text-4xl">
          Novo carro
        </h1>
        <p className="mt-2 text-[var(--color-text-muted)]">
          Preencha os dados do veículo para adicioná-lo ao catálogo.
        </p>
      </section>

      <CarroForm rotuloEnviar="Cadastrar carro" aoSalvar={salvar} />
    </div>
  );
}
