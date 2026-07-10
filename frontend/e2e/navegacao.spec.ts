/**
 * Pré-requisitos: backend (porta 3333) e frontend (porta 3000) rodando.
 * Ver e2e/README.md.
 */
import { test, expect } from "@playwright/test";

test.describe("Navegação", () => {
  test("o menu leva entre Catálogo, Leads e Assistente IA", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: "Encontre seu próximo carro" })
    ).toBeVisible();

    await page.getByRole("link", { name: "Leads" }).click();
    await page.waitForURL("/leads");
    await expect(
      page.getByRole("heading", { name: "Leads recebidos" })
    ).toBeVisible();

    await page.getByRole("link", { name: "Assistente IA" }).click();
    await page.waitForURL("/chat");
    await expect(
      page.getByRole("heading", { name: "Assistente AutoStore" })
    ).toBeVisible();

    await page.getByRole("link", { name: "Catálogo" }).click();
    await page.waitForURL("/");
    await expect(
      page.getByRole("heading", { name: "Encontre seu próximo carro" })
    ).toBeVisible();
  });
});
