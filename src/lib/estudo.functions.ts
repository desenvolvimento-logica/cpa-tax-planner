import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Estudo } from "./estudo";

export type ResumoEstudo = {
  id: string;
  cnpj: string;
  nomeCliente: string;
  atualizadoEm: string;
};

export const listarEstudos = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("tp_estudos")
      .select("id, cnpj, nome_cliente, atualizado_em")
      .order("atualizado_em", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []).map((r: any) => ({
      id: r.id,
      cnpj: r.cnpj,
      nomeCliente: r.nome_cliente,
      atualizadoEm: r.atualizado_em,
    })) as ResumoEstudo[];
  });

export const obterEstudo = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => d)
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("tp_estudos")
      .select("dados")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return ((row as any)?.dados ?? null) as Estudo | null;
  });

export const salvarEstudo = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { estudo: Estudo }) => d)
  .handler(async ({ data, context }) => {
    const cnpj = data.estudo.cadastro.cnpj?.trim();
    if (!cnpj) throw new Error("Informe o CNPJ antes de salvar.");
    const nomeCliente =
      data.estudo.cadastro.nomeFantasia || data.estudo.cadastro.razaoSocial || "Estudo sem nome";

    const { data: existente } = await context.supabase
      .from("tp_estudos")
      .select("id")
      .eq("cnpj", cnpj)
      .maybeSingle();

    const registro = {
      cnpj,
      nome_cliente: nomeCliente,
      dados: data.estudo,
      atualizado_por: context.userId,
      atualizado_em: new Date().toISOString(),
      ...(existente ? {} : { criado_por: context.userId }),
    };

    const { data: salvo, error } = await context.supabase
      .from("tp_estudos")
      .upsert(registro as any, { onConflict: "cnpj" })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: (salvo as any).id as string };
  });

export const excluirEstudo = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => d)
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("tp_estudos").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
