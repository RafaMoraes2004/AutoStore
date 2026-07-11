"use client";

// ATENÇÃO: esta área de administração não possui autenticação nem
// autorização. Ela existe apenas para atender ao CRUD exigido pelo desafio.
// Em produção, toda a rota /admin precisaria estar protegida por login e
// controle de acesso antes de qualquer deploy real.

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { api, ApiError } from "@/lib/api";
import type { Carro } from "@/lib/types";
import { formatarPreco } from "@/lib/format";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { EstadoErro } from "@/components/EstadoErro";
import { EstadoVazio } from "@/components/EstadoVazio";

const MENSAGENS_SUCESSO: Record<string, string> = {
  criado: "Carro cadastrado com sucesso.",
  editado: "Alterações salvas com sucesso.",
};

export default function AdminCarrosPage() {
  const [carros, setCarros] = useState<Carro[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [carroParaRemover, setCarroParaRemover] = useState<Carro | null>(null);
  const [removendo, setRemovendo] = useState(false);
  const [erroRemocao, setErroRemocao] = useState<string | null>(null);
  const [mensagemSucesso, setMensagemSucesso] = useState<string | null>(null);

  const carregarCarros = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      setCarros(await api.listarCarros());
    } catch (e) {
      setErro(
        e instanceof ApiError
          ? e.message
          : "Não foi possível carregar o catálogo."
      );
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregarCarros();
  }, [carregarCarros]);

  useEffect(() => {
    const parametros = new URLSearchParams(window.location.search);
    const chave = parametros.get("sucesso");
    if (chave && MENSAGENS_SUCESSO[chave]) {
      setMensagemSucesso(MENSAGENS_SUCESSO[chave]);
    }
  }, []);

  async function confirmarRemocao() {
    if (!carroParaRemover) return;
    setRemovendo(true);
    setErroRemocao(null);
    try {
      await api.removerCarro(carroParaRemover.id);
      setCarros((atual) => atual.filter((c) => c.id !== carroParaRemover.id));
      setMensagemSucesso("Carro removido com sucesso.");
      setCarroParaRemover(null);
    } catch (e) {
      setErroRemocao(
        e instanceof ApiError
          ? e.message
          : "Não foi possível remover o carro. Tente novamente."
      );
    } finally {
      setRemovendo(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-4 pt-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight sm:text-4xl">
            Administração do catálogo
          </h1>
          <p className="mt-2 text-[var(--color-text-muted)]">
            Cadastre, edite e remova os carros exibidos na vitrine.
          </p>
        </div>
        <Link
          href="/admin/carros/novo"
          className="inline-flex shrink-0 items-center justify-center rounded-lg bg-[var(--color-accent)] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--color-accent-hover)]"
        >
          + Novo carro
        </Link>
      </section>

      {mensagemSucesso && (
        <p className="rounded-lg border border-[var(--color-accent)]/40 bg-[var(--color-accent)]/5 px-4 py-3 text-sm text-[var(--color-accent)]">
          {mensagemSucesso}
        </p>
      )}

      {carregando && <ListaCarregando />}

      {erro && !carregando && <EstadoErro mensagem={erro} />}

      {!carregando && !erro && carros.length === 0 && (
        <EstadoVazio
          titulo="Nenhum carro cadastrado ainda"
          descricao="Clique em “Novo carro” para adicionar o primeiro veículo ao catálogo."
        />
      )}

      {!carregando && !erro && carros.length > 0 && (
        <div className="flex flex-col gap-3">
          {carros.map((carro) => (
            <LinhaCarro
              key={carro.id}
              carro={carro}
              onRemover={() => {
                setErroRemocao(null);
                setCarroParaRemover(carro);
              }}
            />
          ))}
        </div>
      )}

      <ConfirmDialog
        aberto={carroParaRemover !== null}
        titulo="Remover carro?"
        descricao={
          carroParaRemover
            ? `Tem certeza que deseja remover ${carroParaRemover.montadora} ${carroParaRemover.modelo} do catálogo? Essa ação não pode ser desfeita.`
            : ""
        }
        erro={erroRemocao}
        confirmando={removendo}
        onConfirmar={confirmarRemocao}
        onCancelar={() => {
          setCarroParaRemover(null);
          setErroRemocao(null);
        }}
      />
    </div>
  );
}

function LinhaCarro({
  carro,
  onRemover,
}: {
  carro: Carro;
  onRemover: () => void;
}) {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <div>
          <p className="text-xs uppercase tracking-wider text-[var(--color-text-muted)]">
            {carro.montadora}
          </p>
          <p className="font-[family-name:var(--font-display)] text-lg font-semibold">
            {carro.modelo}
          </p>
        </div>
        <span className="rounded-full border border-[var(--color-border)] px-3 py-1 text-xs text-[var(--color-text-muted)]">
          {carro.categoria}
        </span>
        <p className="font-medium">{formatarPreco(carro.preco_a_partir_rs)}</p>
      </div>

      <div className="flex shrink-0 gap-2">
        <Link
          href={`/admin/carros/${carro.id}/editar`}
          className="rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm font-medium transition-colors hover:bg-[var(--color-surface-2)]"
        >
          Editar
        </Link>
        <button
          type="button"
          onClick={onRemover}
          className="rounded-lg border border-red-500/30 px-3 py-2 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/10"
        >
          Remover
        </button>
      </div>
    </div>
  );
}

function ListaCarregando() {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="h-20 animate-pulse rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]"
        />
      ))}
    </div>
  );
}
