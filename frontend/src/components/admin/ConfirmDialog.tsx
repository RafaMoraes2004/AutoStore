"use client";

import { useEffect, useRef } from "react";

interface ConfirmDialogProps {
  aberto: boolean;
  titulo: string;
  descricao: string;
  erro?: string | null;
  confirmando?: boolean;
  rotuloConfirmar?: string;
  onConfirmar: () => void;
  onCancelar: () => void;
}

export function ConfirmDialog({
  aberto,
  titulo,
  descricao,
  erro,
  confirmando = false,
  rotuloConfirmar = "Remover",
  onConfirmar,
  onCancelar,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (aberto && !dialog.open) dialog.showModal();
    if (!aberto && dialog.open) dialog.close();
  }, [aberto]);

  return (
    <dialog
      ref={dialogRef}
      onCancel={(e) => {
        e.preventDefault();
        onCancelar();
      }}
      className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-0 text-[var(--color-text)] backdrop:bg-black/60 backdrop:backdrop-blur-sm"
    >
      <div className="flex w-[min(90vw,26rem)] flex-col gap-4 p-6">
        <div>
          <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold">
            {titulo}
          </h2>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">
            {descricao}
          </p>
        </div>

        {erro && <p className="text-sm text-red-400">{erro}</p>}

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancelar}
            disabled={confirmando}
            className="rounded-lg border border-[var(--color-border)] px-4 py-2 text-sm font-medium transition-colors hover:bg-[var(--color-surface-2)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirmar}
            disabled={confirmando}
            className="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {confirmando ? "Removendo..." : rotuloConfirmar}
          </button>
        </div>
      </div>
    </dialog>
  );
}
