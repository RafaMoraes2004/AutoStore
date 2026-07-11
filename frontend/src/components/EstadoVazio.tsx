interface EstadoVazioProps {
  titulo: string;
  descricao: string;
}

export function EstadoVazio({ titulo, descricao }: EstadoVazioProps) {
  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-12 text-center">
      <p className="font-medium">{titulo}</p>
      <p className="mt-1 text-sm text-[var(--color-text-muted)]">{descricao}</p>
    </div>
  );
}
