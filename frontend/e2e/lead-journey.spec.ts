/**
 * Pré-requisitos: backend (porta 3333), frontend (porta 3000) e PostgreSQL
 * rodando, com `npm run seed` já executado no backend (catálogo de 15
 * carros, incluindo Toyota Corolla com id 1). Ver e2e/README.md.
 *
 * Usa nome/e-mail únicos por execução (timestamp) para não depender de um
 * banco limpo nem da ordem de execução dos testes.
 */
import { test, expect } from "@playwright/test";

test.describe("Jornada de lead", () => {
  test("abrir um carro pelo card, preencher o formulário e confirmar o interesse", async ({
    page,
  }) => {
    const marca = Date.now();
    const nome = `Playwright QA ${marca}`;
    const email = `playwright.qa+${marca}@example.com`;

    await page.goto("/");
    await page
      .getByRole("link")
      .filter({
        has: page.getByRole("heading", {
          level: 3,
          name: "Corolla",
          exact: true,
        }),
      })
      .click();
    await page.waitForURL(/\/carros\/\d+/);

    await expect(
      page.getByRole("heading", { level: 1, name: "Corolla" })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Ficha técnica" })
    ).toBeVisible();
    await expect(page.getByText("Motor")).toBeVisible();

    await page.getByLabel("Nome").fill(nome);
    await page.getByLabel("E-mail").fill(email);

    const telefone = page.getByLabel("Telefone");
    await telefone.fill("11999998888");
    await expect(telefone).toHaveValue("(11) 99999-8888");

    const botaoEnviar = page.getByRole("button", { name: "Tenho interesse" });
    await expect(botaoEnviar).toBeEnabled();
    await botaoEnviar.click();

    await expect(page.getByText("Interesse registrado!")).toBeVisible();

    await page.goto("/leads");

    const card = page.getByTestId("lead-card").filter({ hasText: nome });
    await expect(card).toBeVisible();
    await expect(
      card.getByRole("link", { name: /Interesse em Toyota Corolla/ })
    ).toBeVisible();
  });
});
