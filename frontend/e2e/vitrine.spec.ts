/**
 * Pré-requisitos: backend (porta 3333), frontend (porta 3000) e PostgreSQL
 * rodando, com `npm run seed` já executado no backend (catálogo de 15
 * carros). Ver e2e/README.md para detalhes.
 */
import { test, expect, type Page } from "@playwright/test";

function seletorDropdown(page: Page, rotulo: string) {
  return page.getByText(rotulo, { exact: true }).locator("..").getByRole("button");
}

test.describe("Vitrine", () => {
  test("carrega e exibe os carros vindos do backend", async ({ page }) => {
    await page.goto("/");

    await expect(
      page.getByRole("heading", { name: "Encontre seu próximo carro" })
    ).toBeVisible();

    await expect(page.getByRole("heading", { level: 3 }).first()).toBeVisible();
    await expect(
      page.getByRole("heading", { level: 3, name: "Corolla", exact: true })
    ).toBeVisible();
    await expect(page.getByText("R$ 160.000")).toBeVisible();
  });

  test("filtrar por montadora reduz a lista", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 3 }).first()).toBeVisible();
    const totalInicial = await page.getByRole("heading", { level: 3 }).count();

    await seletorDropdown(page, "Montadora").click();
    await page.getByRole("option", { name: "Toyota" }).getByRole("button").click();

    const carrosFiltrados = page.getByRole("heading", { level: 3 });
    await expect(carrosFiltrados).toHaveText(["Corolla", "Corolla Cross", "Hilux"]);
    expect(await carrosFiltrados.count()).toBeLessThan(totalInicial);
  });

  test("ordenar por menor preço reordena a lista", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 3 }).first()).toBeVisible();

    await page.getByRole("button", { name: "Menor preço" }).click();

    await expect(page.getByRole("heading", { level: 3 }).first()).toHaveText(
      "HB20"
    );
  });

  test("limpar filtros restaura a lista completa", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 3 }).first()).toBeVisible();
    const totalInicial = await page.getByRole("heading", { level: 3 }).count();

    await seletorDropdown(page, "Montadora").click();
    await page.getByRole("option", { name: "Toyota" }).getByRole("button").click();
    await expect(page.getByRole("heading", { level: 3 })).toHaveCount(3);

    await page.getByRole("button", { name: /limpar filtros/i }).click();

    await expect(page.getByRole("heading", { level: 3 })).toHaveCount(
      totalInicial
    );
  });
});
