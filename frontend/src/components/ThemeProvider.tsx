"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

type Tema = "dark" | "light";

interface TemaContexto {
  tema: Tema;
  alternar: () => void;
}

const Contexto = createContext<TemaContexto | null>(null);

const CHAVE_STORAGE = "autostore-tema";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [tema, setTema] = useState<Tema>("dark");

  useEffect(() => {
    const salvo = window.localStorage.getItem(CHAVE_STORAGE) as Tema | null;
    if (salvo === "light" || salvo === "dark") {
      setTema(salvo);
      document.documentElement.setAttribute("data-theme", salvo);
    }
  }, []);

  const alternar = useCallback(() => {
    setTema((atual) => {
      const proximo: Tema = atual === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", proximo);
      window.localStorage.setItem(CHAVE_STORAGE, proximo);
      return proximo;
    });
  }, []);

  return (
    <Contexto.Provider value={{ tema, alternar }}>{children}</Contexto.Provider>
  );
}

export function useTema(): TemaContexto {
  const contexto = useContext(Contexto);
  if (!contexto) {
    throw new Error("useTema deve ser usado dentro de ThemeProvider.");
  }
  return contexto;
}
