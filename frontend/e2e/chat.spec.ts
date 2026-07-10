/**
 * Pré-requisitos: backend (porta 3333) e frontend (porta 3000) rodando,
 * com `npm run seed` E `npm run rag:ingest` já executados no backend
 * (o /chat depende dos embeddings indexados). Ver e2e/README.md.
 *
 * ATENÇÃO: este teste faz uma pergunta real ao assistente, disparando
 * chamadas reais de embedding e geração à API do Gemini — consome cota.
 * Por isso NÃO roda na suíte padrão (`npm run test:e2e`); só executa se a
 * variável de ambiente RUN_CHAT_E2E estiver definida:
 *
 *   RUN_CHAT_E2E=1 npx playwright test e2e/chat.spec.ts
 */
import { test, expect } from "@playwright/test";

test("pergunta sobre um carro específico recebe resposta e permite abrir o lead", async ({
  page,
}) => {
  test.skip(
    !process.env.RUN_CHAT_E2E,
    "Consome cota real da API do Gemini — rode com RUN_CHAT_E2E=1 npx playwright test e2e/chat.spec.ts"
  );

  await page.goto("/chat");
  await expect(
    page.getByRole("heading", { name: "Assistente AutoStore" })
  ).toBeVisible();

  await page
    .getByPlaceholder("Pergunte sobre os carros do catálogo...")
    .fill("Qual o consumo do Corolla?");
  await page.getByRole("button", { name: "Enviar pergunta" }).click();

  await expect(page.getByText(/consumo/i)).toBeVisible({ timeout: 30000 });
  await expect(
    page.getByRole("button", { name: /Tenho interesse no/i })
  ).toBeVisible();
});
