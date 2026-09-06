import { useCallback, useEffect, useState } from "react";
import { diagnosticoPadrao, estudoExemplo, type Estudo } from "./estudo";

const CHAVE = "estudo-jgwebcom-v6";

export function useEstudo() {
  const [estudo, setEstudo] = useState<Estudo>(estudoExemplo);
  const [carregado, setCarregado] = useState(false);

  useEffect(() => {
    try {
      const bruto = window.localStorage.getItem(CHAVE);
      if (bruto) {
        const salvo = JSON.parse(bruto) as Estudo;
        setEstudo({
          ...estudoExemplo,
          ...salvo,
          diagnostico: { ...diagnosticoPadrao, ...(salvo.diagnostico ?? {}) },
        });
      }
    } catch {
      /* ignora dados inválidos */
    }
    setCarregado(true);
  }, []);

  useEffect(() => {
    if (!carregado) return;
    try {
      window.localStorage.setItem(CHAVE, JSON.stringify(estudo));
    } catch {
      /* armazenamento indisponível */
    }
  }, [estudo, carregado]);

  const atualizar = useCallback((patch: Partial<Estudo>) => {
    setEstudo((atual) => ({ ...atual, ...patch }));
  }, []);

  const limpar = useCallback(() => {
    window.localStorage.removeItem(CHAVE);
    window.location.reload();
  }, []);

  return { estudo, setEstudo, atualizar, limpar, carregado };
}
