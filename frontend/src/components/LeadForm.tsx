"use client";

import { useState } from "react";
import { api, ApiError } from "@/lib/api";
import { formatarTelefone } from "@/lib/telefone";

interface LeadFormProps {
  carroId: number;
  nomeCarro: string;
}

type Status = "idle" | "enviando" | "sucesso" | "erro";

export function LeadForm({ carroId, nomeCarro }: LeadFormProps) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [erro, setErro] = useState<string | null>(null);

  const podeEnviar =
    nome.trim().length > 0 &&
    (email.trim().length > 0 || telefone.trim().length > 0);

  async function enviar() {
    if (!podeEnviar || status === "enviando") return;

    setStatus("enviando");
    setErro(null);

    try {
      await api.criarLead({
        nome: nome.trim(),
        email: email.trim() || undefined,
        telefone: telefone.trim() || undefined,
        mensagem: mensagem.trim() || undefined,
        carroId,
      });
      setStatus("sucesso");
    } catch (e) {
      setStatus("erro");
      setErro(
        e instanceof ApiError
          ? e.message
          : "Não foi possível enviar. Tente novamente."
      );
    }
  }

  if (status === "sucesso") {
    return (
      <div className="rounded-xl border border-[var(--color-accent)]/40 bg-[var(--color-accent)]/5 p-6 text-center">
        <p className="font-medium">Interesse registrado!</p>
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">
          Recebemos seu contato sobre o {nomeCarro}. Nossa equipe retornará em
          breve.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
      <p className="text-sm text-[var(--color-text-muted)]">
        Deixe seus dados e nossa equipe entra em contato sobre o {nomeCarro}.
      </p>

      <Campo
        id="nome"
        rotulo="Nome"
        obrigatorio
        valor={nome}
        onChange={setNome}
        placeholder="Seu nome completo"
      />

      <Campo
        id="email"
        rotulo="E-mail"
        tipo="email"
        valor={email}
        onChange={setEmail}
        placeholder="voce@email.com"
      />

      <Campo
        id="telefone"
        rotulo="Telefone"
        valor={telefone}
        onChange={(v) => setTelefone(formatarTelefone(v))}
        placeholder="(11) 99999-9999"
      />

      <div>
        <label
          htmlFor="mensagem"
          className="mb-1.5 block text-xs font-medium text-[var(--color-text-muted)]"
        >
          Mensagem (opcional)
        </label>
        <textarea
          id="mensagem"
          rows={3}
          value={mensagem}
          onChange={(e) => setMensagem(e.target.value)}
          placeholder="Alguma dúvida ou preferência?"
          className="w-full resize-none rounded-lg border border-[var(--color-border)] bg-[var(--color-base)] px-3 py-2 text-sm outline-none transition-colors focus:border-[var(--color-accent)]"
        />
      </div>

      <p className="text-xs text-[var(--color-text-muted)]">
        Informe ao menos um e-mail ou telefone para contato.
      </p>

      {status === "erro" && erro && (
        <p className="text-sm text-red-400">{erro}</p>
      )}

      <button
        type="button"
        onClick={enviar}
        disabled={!podeEnviar || status === "enviando"}
        className="rounded-lg bg-[var(--color-accent)] px-4 py-2.5 font-medium text-white transition-colors hover:bg-[var(--color-accent-hover)] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {status === "enviando" ? "Enviando..." : "Tenho interesse"}
      </button>
    </div>
  );
}

interface CampoProps {
  id: string;
  rotulo: string;
  valor: string;
  onChange: (v: string) => void;
  placeholder?: string;
  tipo?: string;
  obrigatorio?: boolean;
}

function Campo({
  id,
  rotulo,
  valor,
  onChange,
  placeholder,
  tipo = "text",
  obrigatorio = false,
}: CampoProps) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1.5 block text-xs font-medium text-[var(--color-text-muted)]"
      >
        {rotulo}
        {obrigatorio && <span className="text-[var(--color-accent)]"> *</span>}
      </label>
      <input
        id={id}
        type={tipo}
        value={valor}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-base)] px-3 py-2 text-sm outline-none transition-colors focus:border-[var(--color-accent)]"
      />
    </div>
  );
}
