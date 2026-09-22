import { useCallback, useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/app-client";
import { estudoVazio, type Estudo } from "./estudo";
import {
  listarEstudos,
  obterEstudo,
  salvarEstudo as salvarEstudoFn,
  excluirEstudo as excluirEstudoFn,
  type ResumoEstudo,
} from "./estudo.functions";

export type EstudoSalvo = {
  id: string;
  nome: string;
  cnpj: string;
  atualizadoEm: string;
};

export function useEstudo() {
  const [estudo, setEstudo] = useState<Estudo>(estudoVazio);
  const [estudoId, setEstudoId] = useState<string | null>(null);
  const [historico, setHistorico] = useState<EstudoSalvo[]>([]);
  const [carregado, setCarregado] = useState(false);

  const listarFn = useServerFn(listarEstudos);
  const obterFn = useServerFn(obterEstudo);
  const salvarFn = useServerFn(salvarEstudoFn);
  const excluirFn = useServerFn(excluirEstudoFn);

  const carregarHistorico = useCallback(async () => {
    try {
      const resumos = await listarFn();
      setHistorico(
        resumos.map((r: ResumoEstudo) => ({
          id: r.id,
          nome: r.nomeCliente,
          cnpj: r.cnpj,
          atualizadoEm: r.atualizadoEm,
        })),
      );
    } catch {
      /* mantém histórico anterior em caso de falha de rede */
    }
  }, [listarFn]);

  useEffect(() => {
    void carregarHistorico().finally(() => setCarregado(true));
  }, [carregarHistorico]);

  const salvarEstudo = useCallback(
    async (valor: Estudo = estudo) => {
      if (!valor.cadastro.cnpj?.trim()) return;
      try {
        const { id } = await salvarFn({ data: { estudo: valor } });
        setEstudoId(id);
        await carregarHistorico();
      } catch {
        /* falha de rede — próxima alteração tenta salvar de novo */
      }
    },
    [estudo, salvarFn, carregarHistorico],
  );

  const ultimoSalvo = useRef<string>("");
  useEffect(() => {
    if (!carregado || !estudo.cadastro.cnpj) return;
    const chave = JSON.stringify(estudo);
    if (chave === ultimoSalvo.current) return;
    const timer = window.setTimeout(() => {
      ultimoSalvo.current = chave;
      void salvarEstudo(estudo);
    }, 800);
    return () => window.clearTimeout(timer);
  }, [estudo, carregado, salvarEstudo]);

  const abrirEstudo = useCallback(
    async (id: string) => {
      try {
        const dados = await obterFn({ data: { id } });
        if (dados) {
          setEstudo(dados);
          setEstudoId(id);
        }
      } catch {
        /* mantém estudo atual se falhar */
      }
    },
    [obterFn],
  );

  const excluirEstudo = useCallback(
    async (id: string) => {
      try {
        await excluirFn({ data: { id } });
        if (id === estudoId) {
          setEstudo(estudoVazio);
          setEstudoId(null);
        }
        await carregarHistorico();
      } catch {
        /* mantém item na lista se falhar */
      }
    },
    [excluirFn, estudoId, carregarHistorico],
  );

  const atualizar = useCallback((patch: Partial<Estudo>) => {
    setEstudo((atual) => ({ ...atual, ...patch }));
  }, []);

  const limpar = useCallback(() => {
    setEstudo(estudoVazio);
    setEstudoId(null);
  }, []);

  return { estudo, setEstudo, atualizar, limpar, carregado, historico, salvarEstudo, abrirEstudo, excluirEstudo };
}
