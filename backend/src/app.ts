import express from "express";
import type { Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { Prisma } from "@prisma/client";
import { prisma } from "./lib/prisma.js";
import {
  CARRO_CAMPOS_ATUALIZAVEIS,
  CARRO_CAMPOS_OBRIGATORIOS,
  CARRO_CAMPOS_OPCIONAIS_NULLABLE,
  isNonEmptyString,
  isStringArray,
  parseId,
  validarLead,
  type CarroPayload,
  type LeadPayload,
} from "./lib/validation.js";
import { buscarChunksRelevantes } from "./rag/retrieval.js";
import { responderComContexto, type MensagemHistorico } from "./rag/geracao.js";
import { construirQueryBusca, validarHistorico } from "./rag/queryBusca.js";

export const app = express();

app.use(helmet());

// Sem FRONTEND_URL configurada, cai para a origem padrão do dev server do
// Next.js — nunca para "*" (RNF02/AppSec: evita que qualquer site de
// terceiros consiga ler respostas da API via JS no navegador de um visitante).
const corsOrigin = process.env.FRONTEND_URL || "http://localhost:3000";
app.use(cors({ origin: corsOrigin }));
app.use(express.json({ limit: "15kb" }));

const limitadorChat = rateLimit({
  windowMs: 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    erro: "Muitas perguntas em pouco tempo. Aguarde um instante e tente novamente.",
  },
});

app.get("/carros", async (req: Request, res: Response) => {
  try {
    const carros = await prisma.carro.findMany({
      orderBy: { id: "asc" },
    });
    res.status(200).json(carros);
  } catch (error) {
    res.status(500).json({ erro: "Erro interno ao acessar o catálogo." });
  }
});

app.get("/carros/:id", async (req: Request, res: Response) => {
  try {
    const id = parseId(req.params.id);
    if (id === null) {
      res.status(400).json({ erro: "ID de carro inválido." });
      return;
    }

    const carro = await prisma.carro.findUnique({ where: { id } });

    if (!carro) {
      res.status(404).json({ erro: "Carro não encontrado." });
      return;
    }

    res.status(200).json(carro);
  } catch (error) {
    res.status(500).json({ erro: "Erro interno ao buscar o carro." });
  }
});

app.post("/carros", async (req: Request, res: Response) => {
  try {
    const payload: CarroPayload = req.body;

    const camposObrigatoriosValidos = Object.entries(
      CARRO_CAMPOS_OBRIGATORIOS
    ).every(([campo, validador]) =>
      validador(payload[campo as keyof CarroPayload])
    );
    const imagensValidas =
      payload.imagens === undefined || isStringArray(payload.imagens);

    if (!camposObrigatoriosValidos || !imagensValidas) {
      res.status(400).json({
        erro: "Dados obrigatórios ausentes ou inválidos: montadora, modelo, categoria, ano, motor, potencia_cv, cambio, consumo, preco_a_partir_rs, cores, itens e desc são obrigatórios.",
      });
      return;
    }

    const novoCarro = await prisma.carro.create({
      data: {
        montadora: (payload.montadora as string).trim(),
        modelo: (payload.modelo as string).trim(),
        categoria: (payload.categoria as string).trim(),
        ano: payload.ano as number,
        motor: (payload.motor as string).trim(),
        potencia_cv: (payload.potencia_cv as string).trim(),
        cambio: (payload.cambio as string).trim(),
        consumo: (payload.consumo as string).trim(),
        preco_a_partir_rs: payload.preco_a_partir_rs as number,
        preco_obs: isNonEmptyString(payload.preco_obs)
          ? payload.preco_obs.trim()
          : null,
        cores: (payload.cores as string).trim(),
        itens: (payload.itens as string).trim(),
        desc: (payload.desc as string).trim(),
        imagem_arquivo: isNonEmptyString(payload.imagem_arquivo)
          ? payload.imagem_arquivo.trim()
          : null,
        imagens: isStringArray(payload.imagens) ? payload.imagens : [],
        foto_referencia: isNonEmptyString(payload.foto_referencia)
          ? payload.foto_referencia.trim()
          : null,
      },
    });

    res.status(201).json(novoCarro);
  } catch (error) {
    res.status(500).json({ erro: "Erro interno ao cadastrar o carro." });
  }
});

app.patch("/carros/:id", async (req: Request, res: Response) => {
  try {
    const id = parseId(req.params.id);
    if (id === null) {
      res.status(400).json({ erro: "ID de carro inválido." });
      return;
    }

    const payload = req.body as Record<string, unknown>;
    const chavesRecebidas = Object.keys(payload);

    if (chavesRecebidas.length === 0) {
      res.status(400).json({ erro: "Nenhum campo enviado para atualização." });
      return;
    }

    const data: Record<string, unknown> = {};

    for (const chave of chavesRecebidas) {
      if (!CARRO_CAMPOS_ATUALIZAVEIS.has(chave)) {
        res.status(400).json({ erro: `Campo não permitido: ${chave}.` });
        return;
      }

      const valor = payload[chave];

      if (chave === "imagens") {
        if (!isStringArray(valor)) {
          res
            .status(400)
            .json({
              erro: "Campo inválido: imagens deve ser uma lista de textos.",
            });
          return;
        }
        data.imagens = valor;
        continue;
      }

      if (
        (CARRO_CAMPOS_OPCIONAIS_NULLABLE as readonly string[]).includes(chave)
      ) {
        if (valor !== null && !isNonEmptyString(valor)) {
          res.status(400).json({ erro: `Campo inválido: ${chave}.` });
          return;
        }
        data[chave] = typeof valor === "string" ? valor.trim() : null;
        continue;
      }

      const validador = CARRO_CAMPOS_OBRIGATORIOS[chave];
      if (!validador || !validador(valor)) {
        res.status(400).json({ erro: `Campo inválido: ${chave}.` });
        return;
      }
      data[chave] = typeof valor === "string" ? valor.trim() : valor;
    }

    const carroAtualizado = await prisma.carro.update({
      where: { id },
      data: data as Prisma.CarroUpdateInput,
    });

    res.status(200).json(carroAtualizado);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      res.status(404).json({ erro: "Carro não encontrado." });
      return;
    }
    res.status(500).json({ erro: "Erro interno ao atualizar o carro." });
  }
});

app.delete("/carros/:id", async (req: Request, res: Response) => {
  try {
    const id = parseId(req.params.id);
    if (id === null) {
      res.status(400).json({ erro: "ID de carro inválido." });
      return;
    }

    await prisma.carro.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        res.status(404).json({ erro: "Carro não encontrado." });
        return;
      }
      if (error.code === "P2003") {
        res.status(409).json({
          erro: "Não é possível remover este carro: existem leads associados a ele.",
        });
        return;
      }
    }
    res.status(500).json({ erro: "Erro interno ao remover o carro." });
  }
});

app.get("/leads", async (req: Request, res: Response) => {
  try {
    const leads = await prisma.lead.findMany({
      include: { carro: true },
      orderBy: { createdAt: "desc" },
    });
    res.status(200).json(leads);
  } catch (error) {
    res.status(500).json({ erro: "Erro interno ao listar os leads." });
  }
});

app.get("/leads/:id", async (req: Request, res: Response) => {
  try {
    const id = parseId(req.params.id);

    if (id === null) {
      res.status(400).json({ erro: "ID de lead inválido." });
      return;
    }

    const lead = await prisma.lead.findUnique({
      where: { id },
      include: { carro: true },
    });

    if (!lead) {
      res.status(404).json({ erro: "Lead não encontrado." });
      return;
    }

    res.status(200).json(lead);
  } catch (error) {
    res.status(500).json({ erro: "Erro interno ao consultar o lead." });
  }
});

app.post("/leads", async (req: Request, res: Response) => {
  try {
    const payload: LeadPayload = req.body;
    const { valido, carroId: carroIdNumero } = validarLead(payload);

    if (!valido) {
      res.status(400).json({
        erro: "Dados inválidos ou ausentes: nome, (email ou telefone válidos) e carroId são obrigatórios.",
      });
      return;
    }

    const carroExiste = await prisma.carro.findUnique({
      where: { id: carroIdNumero },
      select: { id: true },
    });

    if (!carroExiste) {
      res.status(404).json({ erro: "Carro de interesse não encontrado." });
      return;
    }

    const novoLead = await prisma.lead.create({
      data: {
        nome: payload.nome!.trim(),
        email: payload.email?.trim() || null,
        telefone: payload.telefone?.trim() || null,
        mensagem: payload.mensagem?.trim() || null,
        carroId: carroIdNumero,
      },
      include: { carro: true },
    });

    res.status(201).json(novoLead);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2003"
    ) {
      res.status(404).json({ erro: "Carro de interesse não encontrado." });
      return;
    }
    res.status(500).json({ erro: "Erro interno ao salvar o lead." });
  }
});

app.post("/chat", limitadorChat, async (req: Request, res: Response) => {
  try {
    const { pergunta, historico } = req.body as {
      pergunta?: unknown;
      historico?: unknown;
    };

    const perguntaValida =
      typeof pergunta === "string" &&
      pergunta.trim().length > 0 &&
      pergunta.trim().length <= 500;

    if (!perguntaValida) {
      res
        .status(400)
        .json({ erro: "Pergunta inválida ou ausente (máx. 500 caracteres)." });
      return;
    }

    const historicoValidado: MensagemHistorico[] = validarHistorico(historico);
    const queryBusca = construirQueryBusca(pergunta.trim(), historicoValidado);

    const chunks = await buscarChunksRelevantes(prisma, queryBusca);
    const resposta = await responderComContexto(
      pergunta.trim(),
      chunks,
      historicoValidado
    );

    res.status(200).json({
      resposta,
      fontes: chunks.map((c) => ({
        secao: c.secao,
        slug: c.slug,
        carroId: c.carroId,
        similaridade: Number(c.similaridade.toFixed(4)),
      })),
    });
  } catch (error) {
    res.status(500).json({ erro: "Erro interno ao processar a pergunta." });
  }
});
