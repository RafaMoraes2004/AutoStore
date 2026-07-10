"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { api, ApiError } from "@/lib/api";
import type { FonteChat } from "@/lib/types";
import { LeadForm } from "./LeadForm";

interface Mensagem {
  id: string;
  autor: "usuario" | "assistente";
  texto: string;
  fontes?: FonteChat[];
  erro?: boolean;
}

const SUGESTOES = [
  "Qual carro tem o menor preço?",
  "Quais são os carros elétricos?",
  "Compare o Onix e o HB20",
  "Qual carro é bom para família?",
];

export function ChatUI() {
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [entrada, setEntrada] = useState("");
  const [enviando, setEnviando] = useState(false);
  const fimRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fimRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensagens, enviando]);

  async function enviar(pergunta: string) {
    const texto = pergunta.trim();
    if (!texto || enviando) return;

    const msgUsuario: Mensagem = {
      id: `u-${Date.now()}`,
      autor: "usuario",
      texto,
    };
    setMensagens((atual) => [...atual, msgUsuario]);
    setEntrada("");
    setEnviando(true);

    const historico = mensagens
      .slice(-6)
      .map((m) => ({ autor: m.autor, texto: m.texto }));

    try {
      const resposta = await api.perguntarAoChat(texto, historico);
      setMensagens((atual) => [
        ...atual,
        {
          id: `a-${Date.now()}`,
          autor: "assistente",
          texto: resposta.resposta,
          fontes: resposta.fontes,
        },
      ]);
    } catch (e) {
      setMensagens((atual) => [
        ...atual,
        {
          id: `a-${Date.now()}`,
          autor: "assistente",
          texto:
            e instanceof ApiError
              ? e.message
              : "Não consegui responder agora. Tente novamente.",
          erro: true,
        },
      ]);
    } finally {
      setEnviando(false);
    }
  }

  const vazio = mensagens.length === 0;

  return (
    <div className="flex h-[calc(100vh-13rem)] flex-col">
      <div className="flex-1 overflow-y-auto">
        {vazio ? (
          <TelaInicial onSugestao={enviar} />
        ) : (
          <div className="mx-auto flex max-w-3xl flex-col gap-6 py-4">
            {mensagens.map((msg) => (
              <Balao key={msg.id} mensagem={msg} />
            ))}
            {enviando && <Digitando />}
            <div ref={fimRef} />
          </div>
        )}
      </div>

      <div className="mx-auto w-full max-w-3xl pt-4">
        <div className="flex items-end gap-2 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-2">
          <textarea
            value={entrada}
            onChange={(e) => setEntrada(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                enviar(entrada);
              }
            }}
            placeholder="Pergunte sobre os carros do catálogo..."
            rows={1}
            className="max-h-32 flex-1 resize-none bg-transparent px-3 py-2 text-sm outline-none"
          />
          <button
            type="button"
            onClick={() => enviar(entrada)}
            disabled={!entrada.trim() || enviando}
            aria-label="Enviar pergunta"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--color-accent)] text-white transition-colors hover:bg-[var(--color-accent-hover)] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <svg viewBox="0 0 20 20" className="h-5 w-5" fill="currentColor">
              <path d="M2 10 L18 3 L11 18 L9 11 Z" />
            </svg>
          </button>
        </div>
        <p className="mt-2 text-center text-xs text-[var(--color-text-muted)]">
          O assistente responde apenas com base no catálogo da AutoStore.
        </p>
      </div>
    </div>
  );
}

function TelaInicial({ onSugestao }: { onSugestao: (t: string) => void }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 text-center">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold">
          Assistente AutoStore
        </h1>
        <p className="mt-2 max-w-md text-[var(--color-text-muted)]">
          Tire dúvidas sobre os carros do catálogo: preços, motorização,
          consumo, comparações e recomendações.
        </p>
      </div>
      <div className="grid w-full max-w-lg grid-cols-1 gap-2 sm:grid-cols-2">
        {SUGESTOES.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onSugestao(s)}
            className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-left text-sm transition-colors hover:border-[var(--color-accent)]"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}

function Balao({ mensagem }: { mensagem: Mensagem }) {
  const ehUsuario = mensagem.autor === "usuario";
  const [mostrarLead, setMostrarLead] = useState(false);

  const carroSugerido = obterCarroSugerido(mensagem.fontes);

  return (
    <div className={`flex ${ehUsuario ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
          ehUsuario
            ? "bg-[var(--color-accent)] text-white"
            : mensagem.erro
            ? "border border-red-500/30 bg-red-500/5 text-red-400"
            : "border border-[var(--color-border)] bg-[var(--color-surface)]"
        }`}
      >
        <p className="whitespace-pre-wrap">{mensagem.texto}</p>

        {mensagem.fontes && mensagem.fontes.length > 0 && (
          <details className="mt-3 border-t border-[var(--color-border)] pt-2">
            <summary className="cursor-pointer text-xs text-[var(--color-text-muted)]">
              Fontes consultadas ({mensagem.fontes.length})
            </summary>
            <ul className="mt-2 flex flex-col gap-1">
              {mensagem.fontes.map((f, i) => (
                <li
                  key={i}
                  className="flex items-center justify-between gap-2 text-xs text-[var(--color-text-muted)]"
                >
                  <span>
                    {f.carroId ? (
                      <Link
                        href={`/carros/${f.carroId}`}
                        className="text-[var(--color-accent)] hover:underline"
                      >
                        {f.secao}
                      </Link>
                    ) : (
                      f.secao
                    )}
                  </span>
                  <span className="shrink-0 opacity-60">
                    {Math.round(f.similaridade * 100)}%
                  </span>
                </li>
              ))}
            </ul>
          </details>
        )}

        {!ehUsuario && !mensagem.erro && carroSugerido && (
          <div className="mt-3 border-t border-[var(--color-border)] pt-3">
            {mostrarLead ? (
              <LeadForm
                carroId={carroSugerido.id}
                nomeCarro={carroSugerido.nome}
              />
            ) : (
              <button
                type="button"
                onClick={() => setMostrarLead(true)}
                className="w-full rounded-lg border border-[var(--color-accent)] bg-[var(--color-accent)]/10 px-4 py-2 text-sm font-medium text-[var(--color-accent)] transition-colors hover:bg-[var(--color-accent)]/20"
              >
                Tenho interesse no {carroSugerido.nome}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const LIMIAR_SIMILARIDADE_RELEVANTE = 0.5;
const LIMIAR_DOMINANCIA = 0.6;

function obterCarroSugerido(
  fontes: FonteChat[] | undefined
): { id: number; nome: string } | null {
  if (!fontes || fontes.length === 0) return null;

  const relevantes = fontes.filter(
    (f) => f.similaridade >= LIMIAR_SIMILARIDADE_RELEVANTE
  );
  if (relevantes.length === 0) return null;

  // Fontes sem carroId (chunks "Comparativo —" ou de base de conhecimento) indicam
  // resposta comparativa/genérica: sua presença entre as fontes relevantes veta a
  // sugestão, mesmo que um único carroId específico domine as demais fontes.
  if (relevantes.some((f) => f.carroId === null)) return null;

  const contagem = new Map<number, { nome: string; total: number }>();
  for (const f of relevantes) {
    const carroId = f.carroId as number;
    const nome = f.secao.split("—")[0]?.trim() ?? "este carro";
    const atual = contagem.get(carroId);
    contagem.set(carroId, {
      nome,
      total: (atual?.total ?? 0) + 1,
    });
  }

  let melhorId: number | null = null;
  let melhorTotal = 0;
  for (const [id, dados] of contagem) {
    if (dados.total > melhorTotal) {
      melhorTotal = dados.total;
      melhorId = id;
    }
  }

  if (melhorId === null) return null;
  const dominancia = melhorTotal / relevantes.length;
  if (dominancia < LIMIAR_DOMINANCIA) return null;

  const dados = contagem.get(melhorId)!;
  return { id: melhorId, nome: dados.nome };
}

function Digitando() {
  return (
    <div className="flex justify-start">
      <div className="flex gap-1 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-2 w-2 animate-bounce rounded-full bg-[var(--color-text-muted)]"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  );
}
