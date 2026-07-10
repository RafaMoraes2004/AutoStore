import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LeadForm } from "./LeadForm";
import { api, ApiError } from "@/lib/api";

vi.mock("@/lib/api", () => ({
  api: { criarLead: vi.fn() },
  ApiError: class ApiError extends Error {
    status: number;
    constructor(message: string, status: number) {
      super(message);
      this.status = status;
    }
  },
}));

const criarLeadMock = vi.mocked(api.criarLead);

beforeEach(() => {
  criarLeadMock.mockReset();
});

function renderForm() {
  render(<LeadForm carroId={1} nomeCarro="Toyota Corolla" />);
  return {
    nome: screen.getByLabelText(/nome/i),
    email: screen.getByLabelText(/e-mail/i),
    telefone: screen.getByLabelText(/telefone/i),
    botao: screen.getByRole("button", { name: /tenho interesse/i }),
  };
}

describe("LeadForm", () => {
  it("mantém o botão desabilitado sem nome nem contato", () => {
    const { botao } = renderForm();
    expect(botao).toBeDisabled();
  });

  it("mantém o botão desabilitado com nome preenchido mas sem contato", async () => {
    const usuario = userEvent.setup();
    const { nome, botao } = renderForm();

    await usuario.type(nome, "Ana Silva");

    expect(botao).toBeDisabled();
  });

  it("habilita o botão ao preencher nome e email", async () => {
    const usuario = userEvent.setup();
    const { nome, email, botao } = renderForm();

    await usuario.type(nome, "Ana Silva");
    await usuario.type(email, "ana@example.com");

    expect(botao).toBeEnabled();
  });

  it("habilita o botão ao preencher nome e telefone, mesmo sem email", async () => {
    const usuario = userEvent.setup();
    const { nome, telefone, botao } = renderForm();

    await usuario.type(nome, "Ana Silva");
    await usuario.type(telefone, "11999998888");

    expect(botao).toBeEnabled();
  });

  it("aplica a máscara de telefone conforme o usuário digita", async () => {
    const usuario = userEvent.setup();
    const { telefone } = renderForm();

    await usuario.type(telefone, "11999998888");

    expect(telefone).toHaveValue("(11) 99999-8888");
  });

  it("envia os dados corretos ao Prisma via api.criarLead e mostra confirmação", async () => {
    criarLeadMock.mockResolvedValue({
      id: 1,
      nome: "Ana Silva",
      email: "ana@example.com",
      telefone: null,
      mensagem: null,
      carroId: 1,
      createdAt: new Date().toISOString(),
    });

    const usuario = userEvent.setup();
    const { nome, email, botao } = renderForm();

    await usuario.type(nome, "  Ana Silva  ");
    await usuario.type(email, "ana@example.com");
    await usuario.click(botao);

    expect(criarLeadMock).toHaveBeenCalledWith({
      nome: "Ana Silva",
      email: "ana@example.com",
      telefone: undefined,
      mensagem: undefined,
      carroId: 1,
    });
    expect(
      await screen.findByText("Interesse registrado!")
    ).toBeInTheDocument();
  });

  it("mostra mensagem de erro quando o envio falha", async () => {
    criarLeadMock.mockRejectedValue(
      new ApiError("Carro de interesse não encontrado.", 404)
    );

    const usuario = userEvent.setup();
    const { nome, email, botao } = renderForm();

    await usuario.type(nome, "Ana Silva");
    await usuario.type(email, "ana@example.com");
    await usuario.click(botao);

    expect(
      await screen.findByText("Carro de interesse não encontrado.")
    ).toBeInTheDocument();
  });
});
