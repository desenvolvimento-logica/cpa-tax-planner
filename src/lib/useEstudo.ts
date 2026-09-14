import { useCallback, useEffect, useState } from "react";
import { diagnosticoPadrao, estudoExemplo, type Estudo } from "./estudo";

const CHAVE = "estudo-jgwebcom-v9";
const CHAVE_HISTORICO = "estudos-clientes-v1";

export type EstudoSalvo = {
  id: string;
  nome: string;
  cnpj: string;
  atualizadoEm: string;
  estudo: Estudo;
};

const idDoEstudo = (estudo: Estudo) => estudo.cadastro.cnpj.replace(/\D/g, "") || crypto.randomUUID();

const normalizarEstudo = (salvo: Estudo): Estudo => ({
  ...estudoExemplo,
  ...salvo,
  folha: salvo.folha ?? estudoExemplo.folha,
  tributacoesNacionais: salvo.tributacoesNacionais ?? [],
  diagnostico: { ...diagnosticoPadrao, ...(salvo.diagnostico ?? {}) },
});

export function useEstudo() {
  const [estudo, setEstudo] = useState<Estudo>(estudoExemplo);
  const [historico, setHistorico] = useState<EstudoSalvo[]>([]);
  const [carregado, setCarregado] = useState(false);

  useEffect(() => {
    try {
      const bruto = window.localStorage.getItem(CHAVE);
      if (bruto) {
        const salvo = JSON.parse(bruto) as Estudo;
        setEstudo(normalizarEstudo(salvo));
      }
      const historicoBruto = window.localStorage.getItem(CHAVE_HISTORICO);
      if (historicoBruto) setHistorico(JSON.parse(historicoBruto) as EstudoSalvo[]);
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

  const salvarEstudo = useCallback((valor: Estudo = estudo) => {
    const cnpj = valor.cadastro.cnpj;
    const nome = valor.cadastro.nomeFantasia || valor.cadastro.razaoSocial || "Estudo sem nome";
    const cnpjId = cnpj.replace(/\D/g, "");
    setHistorico((atuais) => {
      const existente = cnpjId ? atuais.find((item) => item.cnpj.replace(/\D/g, "") === cnpjId) : undefined;
      const item: EstudoSalvo = {
        id: existente?.id ?? idDoEstudo(valor),
        nome,
        cnpj,
        atualizadoEm: new Date().toISOString(),
        estudo: valor,
      };
      const novos = [item, ...atuais.filter((anterior) => anterior.id !== item.id)];
      window.localStorage.setItem(CHAVE_HISTORICO, JSON.stringify(novos));
      return novos;
    });
  }, [estudo]);

  useEffect(() => {
    if (!carregado || !estudo.cadastro.cnpj) return;
    const timer = window.setTimeout(() => salvarEstudo(estudo), 500);
    return () => window.clearTimeout(timer);
  }, [estudo, carregado, salvarEstudo]);

  const abrirEstudo = useCallback((id: string) => {
    const salvo = historico.find((item) => item.id === id);
    if (salvo) setEstudo(normalizarEstudo(salvo.estudo));
  }, [historico]);

  const excluirEstudo = useCallback((id: string) => {
    setHistorico((atuais) => {
      const novos = atuais.filter((item) => item.id !== id);
      window.localStorage.setItem(CHAVE_HISTORICO, JSON.stringify(novos));
      return novos;
    });
  }, []);

  const atualizar = useCallback((patch: Partial<Estudo>) => {
    setEstudo((atual) => ({ ...atual, ...patch }));
  }, []);

  const limpar = useCallback(() => {
    window.localStorage.removeItem(CHAVE);
    window.location.reload();
  }, []);

  return { estudo, setEstudo, atualizar, limpar, carregado, historico, salvarEstudo, abrirEstudo, excluirEstudo };
}
