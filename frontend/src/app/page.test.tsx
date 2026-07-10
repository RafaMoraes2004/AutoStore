import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, within, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import VitrinePage from "./page";
import { api } from "@/lib/api";
import type { Carro } from "@/lib/types";

vi.mock("@/lib/api", () => ({
  api: { listarCarros: vi.fn() },
  ApiError: class ApiError extends Error {
    status: number;
    constructor(message: string, status: number) {
      super(message);
      this.status = status;
    }
  },
}));

const listarCarrosMock = vi.mocked(api.listarCarros);

function criarCarro(overrides: Partial<Carro>): Carro {
  return {
    id: 1,
    montadora: "Toyota",
    modelo: "Corolla",
    categoria: "Sedan",
    ano: 2026,
    motor: "2.0 Flex",
    potencia_cv: "175",
    cambio: "CVT",
    consumo: "12 km/l",
    preco_a_partir_rs: 160000,
    preco_obs: null,
    cores: "Branco",
    itens: "Ar-condicionado",
    desc: "Sedan médio",
    imagem_arquivo: null,
    imagens: [],
    foto_referencia: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

const CARROS: Carro[] = [
  criarCarro({ id: 1, montadora: "Toyota", modelo: "Corolla", preco_a_partir_rs: 160000 }),
  criarCarro({ id: 2, montadora: "Toyota", modelo: "Hilux", preco_a_partir_rs: 220000 }),
  criarCarro({ id: 3, montadora: "Chevrolet", modelo: "Onix", preco_a_partir_rs: 99990 }),
  criarCarro({ id: 4, montadora: "Hyundai", modelo: "HB20", preco_a_partir_rs: 95790 }),
];

beforeEach(() => {
  listarCarrosMock.mockReset();
  listarCarrosMock.mockResolvedValue(CARROS);
});

function nomesExibidos() {
  return screen.getAllByRole("heading", { level: 3 }).map((h) => h.textContent);
}

function trigger(rotulo: string) {
  const label = screen.getByText(rotulo);
  return within(label.parentElement as HTMLElement).getByRole("button");
}

async function renderVitrine() {
  render(<VitrinePage />);
  await waitFor(() => expect(nomesExibidos()).toHaveLength(CARROS.length));
}

describe("VitrinePage", () => {
  it("lista todos os carros ao carregar", async () => {
    await renderVitrine();
    expect(nomesExibidos()).toEqual(["Corolla", "Hilux", "Onix", "HB20"]);
  });

  it("filtra por montadora e reduz a lista", async () => {
    const usuario = userEvent.setup();
    await renderVitrine();

    await usuario.click(trigger("Montadora"));
    await usuario.click(
      within(screen.getByRole("option", { name: "Toyota" })).getByRole(
        "button"
      )
    );

    await waitFor(() => {
      expect(nomesExibidos()).toEqual(["Corolla", "Hilux"]);
    });
  });

  it("ordena por menor preço", async () => {
    const usuario = userEvent.setup();
    await renderVitrine();

    await usuario.click(screen.getByRole("button", { name: "Menor preço" }));

    await waitFor(() => {
      expect(nomesExibidos()).toEqual(["HB20", "Onix", "Corolla", "Hilux"]);
    });
  });

  it("limpar filtros restaura a lista completa e a ordenação padrão", async () => {
    const usuario = userEvent.setup();
    await renderVitrine();

    await usuario.click(trigger("Montadora"));
    await usuario.click(
      within(screen.getByRole("option", { name: "Toyota" })).getByRole(
        "button"
      )
    );
    await waitFor(() => expect(nomesExibidos()).toEqual(["Corolla", "Hilux"]));

    await usuario.click(screen.getByRole("button", { name: "Menor preço" }));
    await waitFor(() => expect(nomesExibidos()).toEqual(["Corolla", "Hilux"]));

    await usuario.click(screen.getByRole("button", { name: /limpar filtros/i }));

    await waitFor(() => {
      expect(nomesExibidos()).toEqual(["Corolla", "Hilux", "Onix", "HB20"]);
    });
  });

  it("busca por texto filtra por montadora ou modelo", async () => {
    const usuario = userEvent.setup();
    await renderVitrine();

    await usuario.type(screen.getByPlaceholderText(/modelo, montadora/i), "onix");

    await waitFor(() => {
      expect(nomesExibidos()).toEqual(["Onix"]);
    });
  });
});
