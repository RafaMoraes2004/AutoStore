import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

async function main() {
  console.log("Iniciando a carga de dados na Continental Motors...");

  // 1. Lê o arquivo JSON
  const jsonPath = path.join(__dirname, "carros_catalogo.json");
  const fileData = fs.readFileSync(jsonPath, "utf-8");
  const data = JSON.parse(fileData);

  // 2. Limpa a tabela antes de inserir (evita duplicatas se você rodar o comando duas vezes)
  await prisma.carro.deleteMany();
  console.log("Tabela de carros higienizada.");

  // 3. O JSON fornecido tem os carros dentro da propriedade "vehicles"
  const carros = data.vehicles;

  for (const item of carros) {
    await prisma.carro.create({
      data: {
        montadora: item.montadora,
        modelo: item.modelo,
        categoria: item.categoria,
        ano: item.ano,
        motor: item.motor,
        potencia_cv: item.potencia_cv,
        cambio: item.cambio,
        consumo: item.consumo,
        preco_a_partir_rs: item.preco_a_partir_rs,
        preco_obs: item.preco_obs,
        cores: item.cores,
        itens: item.itens,
        desc: item.desc,
        imagem_arquivo: item.imagem_arquivo,
        imagens: item.imagens, // O Prisma mapeia isso automaticamente para um array nativo do PostgreSQL
        foto_referencia: item.foto_referencia,
      },
    });
  }

  console.log(
    `Sucesso! ${carros.length} veículos foram injetados no banco de dados.`
  );
}

main()
  .catch((e) => {
    console.error("Erro ao injetar dados:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
