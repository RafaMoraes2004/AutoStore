"use client";

// ATENÇÃO: sem autenticação — ver nota em /admin/carros/page.tsx.

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import type { Carro, NovoCarro } from "@/lib/types";
import { CarroForm } from "@/components/admin/CarroForm";

export default function EditarCarroPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const carroId = Number(id);
  const router = useRouter();

  const [carro, setCarro] = useState<Carro | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (!Number.isInteger(carroId) || carroId <= 0) {
      setErro("Carro inválido.");
      setCarregando(false);
      return;
    }

    let ativo = true;
    setCarregando(true);
    setErro(null);

    api
      .buscarCarro(carroId)
      .then((dados) => {
        if (ativo) setCarro(dados);
      })
      .catch((e) => {
        if (ativo) {
          setErro(
            e instanceof ApiError && e.status === 404
              ? "Carro não encontrado."
              : "Não foi possível carregar este carro."
          );
        }
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });

    return () => {
      ativo = false;
    };
  }, [carroId]);

  async function salvar(dados: NovoCarro) {
    await api.atualizarCarro(carroId, dados);
    router.push("/admin/carros?sucesso=editado");
  }

  return (
    <div className="flex flex-col gap-6">
      <section className="pt-4">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight sm:text-4xl">
          Editar carro
        </h1>
        {carro && (
          <p className="mt-2 text-[var(--color-text-muted)]">
            {carro.montadora} {carro.modelo}
          </p>
        )}
      </section>

      {carregando && <FormularioCarregando />}

      {erro && !carregando && (
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-12 text-center">
          <p className="font-medium">{erro}</p>
          <Link
            href="/admin/carros"
            className="mt-4 inline-block text-sm text-[var(--color-accent)] hover:underline"
          >
            ← Voltar à administração
          </Link>
        </div>
      )}

      {!carregando && !erro && carro && (
        <CarroForm
          carroInicial={carro}
          rotuloEnviar="Salvar alterações"
          aoSalvar={salvar}
        />
      )}
    </div>
  );
}

function FormularioCarregando() {
  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="h-32 animate-pulse rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]"
        />
      ))}
    </div>
  );
}
