import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  // Sem isso, o Turbopack detecta um package-lock.json não relacionado em
  // /home/rafael (outro projeto) e escolhe a home do usuário como raiz do
  // workspace, gerando caminhos internos longos demais que colidem com um
  // bug de corte de string multibyte do Turbopack (o caminho do projeto
  // contém "Área de trabalho") e derrubam o `next dev` em algumas rotas.
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
