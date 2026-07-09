import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

interface CarroCatalogo {
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
  console.log("Iniciando a carga de dados na Continental Motors...");

  const jsonPath = path.join(import.meta.dirname, "carros_catalogo.json");
  const fileData = fs.readFileSync(jsonPath, "utf-8");
  const data = JSON.parse(fileData) as { vehicles: CarroCatalogo[] };

  await prisma.carro.deleteMany();
  console.log("Tabela de carros higienizada.");

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
        imagens: item.imagens,
        foto_referencia: item.foto_referencia,
      },
    });
  }

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
