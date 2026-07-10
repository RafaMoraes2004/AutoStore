import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

interface CarroCatalogo {
  id: number;
  montadora: string;
  modelo: string;
  categoria: string;
  ano: number;
  motor: string;
  potencia_cv: string;
  cambio: string;
  consumo: string;
  preco_a_partir_rs: number;
  preco_obs?: string;
  cores: string;
  itens: string;
  desc: string;
  imagem_arquivo?: string;
  imagens: string[];
  foto_referencia?: string;
}

async function main() {
  console.log("Iniciando a carga de dados na AutoStore...");

  const jsonPath = path.join(import.meta.dirname, "carros_catalogo.json");
  const fileData = fs.readFileSync(jsonPath, "utf-8");
  const data = JSON.parse(fileData) as { vehicles: CarroCatalogo[] };

  // RESTART IDENTITY zera o autoincrement do Postgres, que deleteMany() não faz.
  // Os ids dos carros precisam bater com o carroId gravado em "embeddings" pela
  // ingestão do RAG (prisma/ingest.ts), por isso são inseridos explicitamente.
  await prisma.$executeRaw`TRUNCATE TABLE "leads", "carros" RESTART IDENTITY CASCADE;`;
  console.log("Tabela de carros higienizada.");

  const carros = data.vehicles;

  for (const item of carros) {
    await prisma.carro.create({
      data: {
        id: item.id,
        montadora: item.montadora,
        modelo: item.modelo,
        categoria: item.categoria,
        ano: item.ano,
        motor: item.motor,
        potencia_cv: item.potencia_cv,
        cambio: item.cambio,
        consumo: item.consumo,
        preco_a_partir_rs: item.preco_a_partir_rs,
        preco_obs: item.preco_obs ?? null,
        cores: item.cores,
        itens: item.itens,
        desc: item.desc,
        imagem_arquivo: item.imagem_arquivo ?? null,
        imagens: item.imagens,
        foto_referencia: item.foto_referencia ?? null,
      },
    });
  }

  // Ids foram inseridos explicitamente, então a sequence do autoincrement fica
  // parada em 1; sincroniza para o maior id inserido antes de liberar o uso normal.
  await prisma.$executeRaw`SELECT setval(pg_get_serial_sequence('"carros"', 'id'), (SELECT MAX(id) FROM "carros"));`;

  console.log(
    `Sucesso! ${carros.length} veiculos foram injetados no banco de dados.`
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
