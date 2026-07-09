import express, { Request, Response } from "express";
import cors from "cors";
import { Prisma, PrismaClient } from "@prisma/client";

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

interface LeadPayload {
  nome?: string;
  email?: string;
  telefone?: string;
  mensagem?: string;
  carroId?: number | string;
}

function parseId(rawId: string): number | null {
  const id = Number(rawId);
  return Number.isInteger(id) && id > 0 ? id : null;
}

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
    const { nome, email, telefone, mensagem, carroId }: LeadPayload = req.body;

    const nomeValido = typeof nome === "string" && nome.trim().length > 0;
    const contatoValido =
      (typeof email === "string" && email.trim().length > 0) ||
      (typeof telefone === "string" && telefone.trim().length > 0);
    const carroIdNumero = Number(carroId);
    const carroIdValido =
      carroId !== undefined &&
      Number.isInteger(carroIdNumero) &&
      carroIdNumero > 0;

    if (!nomeValido || !contatoValido || !carroIdValido) {
      res.status(400).json({
        erro: "Dados obrigatórios ausentes: nome, (email ou telefone) e carroId são necessários.",
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
        nome: nome!.trim(),
        email: email?.trim() || null,
        telefone: telefone?.trim() || null,
        mensagem: mensagem?.trim() || null,
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

const PORT = process.env.PORT || 3333;

app.listen(PORT, () => {
  console.log(`Servidor Continental Motors ativo na porta ${PORT}`);
});
