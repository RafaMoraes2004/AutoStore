interface EstadoErroProps {
  mensagem: string;
  sugestao?: string;
}

export function EstadoErro({
  mensagem,
  sugestao = "Verifique se o servidor está ativo e tente novamente.",
}: EstadoErroProps) {
  return (
    <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-8 text-center">
      <p className="font-medium text-red-400">{mensagem}</p>
      <p className="mt-1 text-sm text-[var(--color-text-muted)]">{sugestao}</p>
    </div>
  );
}
