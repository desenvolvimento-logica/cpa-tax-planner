import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { Cadastro, CnaeItem } from "./estudo";

type BrasilApiCnae = { codigo?: number; descricao?: string };
type BrasilApiCnpj = {
  cnpj?: string;
  razao_social?: string;
  nome_fantasia?: string;
  descricao_situacao_cadastral?: string;
  natureza_juridica?: string;
  codigo_natureza_juridica?: number;
  capital_social?: number;
  data_inicio_atividade?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  municipio?: string;
  uf?: string;
  cep?: string;
  descricao_porte?: string;
  opcao_pelo_simples?: boolean;
  opcao_pelo_mei?: boolean;
  cnae_fiscal?: number;
  cnae_fiscal_descricao?: string;
  cnaes_secundarios?: BrasilApiCnae[];
};

type IbgeCnae = { descricao?: string; observacoes?: string[] };

const formatarCnpj = (valor: string) =>
  valor.replace(/\D/g, "").replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");

const formatarData = (valor?: string) => {
  if (!valor) return "";
  const [ano, mes, dia] = valor.split("-");
  return ano && mes && dia ? `${dia}/${mes}/${ano}` : valor;
};

const formatarCep = (valor?: string) => {
  const digitos = (valor ?? "").replace(/\D/g, "");
  return digitos.length === 8 ? `${digitos.slice(0, 5)}-${digitos.slice(5)}` : valor ?? "";
};

const formatarCnae = (valor: number | string) => {
  const digitos = String(valor).replace(/\D/g, "").padStart(7, "0");
  return `${digitos.slice(0, 4)}-${digitos[4]}/${digitos.slice(5)}`;
};

const anexoDoCnae = (codigo: string) => {
  const digitos = codigo.replace(/\D/g, "");
  const regras: Record<string, string> = {
    "7311400": "Anexo V, sujeito ao Fator R; Anexo III quando o Fator R for igual ou superior a 28%",
    "6201501": "Anexo V, sujeito ao Fator R; Anexo III quando o Fator R for igual ou superior a 28%",
    "6209100": "Anexo V, sujeito ao Fator R; atividades de instalação podem exigir análise específica",
  };
  return regras[digitos] ?? "Anexo a confirmar conforme a atividade efetivamente prestada e as regras do Fator R";
};

const separarObservacoes = (observacoes: string[] = []) => {
  const compreende: string[] = [];
  const naoCompreende: string[] = [];
  for (const observacao of observacoes) {
    const destino = /n[aã]o compreende/i.test(observacao) ? naoCompreende : compreende;
    destino.push(
      observacao
        .replace(/^Esta (?:sub)?classe\s+(?:NÃO\s+)?compreende\s*-?\s*/i, "")
        .replace(/\r/g, "")
        .trim(),
    );
  }
  return { compreende: compreende.join("\n"), naoCompreende: naoCompreende.join("\n") };
};

async function consultarCnae(codigo: number, descricaoBase: string, indice: number): Promise<CnaeItem> {
  const codigoFormatado = formatarCnae(codigo);
  try {
    const resposta = await fetch(`https://servicodados.ibge.gov.br/api/v2/cnae/subclasses/${codigo}`, {
      signal: AbortSignal.timeout(8_000),
    });
    if (!resposta.ok) throw new Error("CNAE indisponível");
    const dados = (await resposta.json()) as IbgeCnae;
    const notas = separarObservacoes(dados.observacoes);
    return {
      id: `receita-${codigo}-${indice}`,
      codigo: codigoFormatado,
      descricao: dados.descricao ?? descricaoBase,
      ...notas,
      anexo: anexoDoCnae(codigoFormatado),
    };
  } catch {
    return {
      id: `receita-${codigo}-${indice}`,
      codigo: codigoFormatado,
      descricao: descricaoBase,
      compreende: "",
      naoCompreende: "",
      anexo: anexoDoCnae(codigoFormatado),
    };
  }
}

export const consultarCnpjPublico = createServerFn({ method: "POST" })
  .inputValidator((entrada) => z.object({ cnpj: z.string() }).parse(entrada))
  .handler(async ({ data }): Promise<{ cadastro: Partial<Cadastro>; cnaes: CnaeItem[] }> => {
    const cnpj = data.cnpj.replace(/\D/g, "");
    if (cnpj.length !== 14) throw new Error("CNPJ inválido na declaração de faturamento.");

    const resposta = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpj}`, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(12_000),
    });
    if (!resposta.ok) throw new Error("Não foi possível consultar o cadastro público deste CNPJ.");
    const dados = (await resposta.json()) as BrasilApiCnpj;

    const atividades = [
      ...(dados.cnae_fiscal
        ? [{ codigo: dados.cnae_fiscal, descricao: dados.cnae_fiscal_descricao ?? "" }]
        : []),
      ...(dados.cnaes_secundarios ?? []).filter((item): item is { codigo: number; descricao?: string } =>
        Number.isFinite(item.codigo),
      ),
    ];
    const cnaes = await Promise.all(
      atividades.map((item, indice) => consultarCnae(item.codigo, item.descricao ?? "", indice)),
    );

    const endereco = [
      [dados.logradouro, dados.numero].filter(Boolean).join(", "),
      dados.complemento,
      dados.bairro,
      [dados.municipio, dados.uf].filter(Boolean).join("/") ,
      formatarCep(dados.cep),
    ]
      .filter(Boolean)
      .join(" — ");
    const regimeAtual = dados.opcao_pelo_mei
      ? "MEI"
      : dados.opcao_pelo_simples
        ? "Simples Nacional"
        : "Regime normal";
    const natureza = [dados.codigo_natureza_juridica, dados.natureza_juridica].filter(Boolean).join(" — ");

    return {
      cadastro: {
        cnpj: formatarCnpj(dados.cnpj ?? cnpj),
        razaoSocial: dados.razao_social ?? "",
        nomeFantasia: dados.nome_fantasia ?? "",
        abertura: formatarData(dados.data_inicio_atividade),
        endereco,
        situacao: [dados.descricao_situacao_cadastral, dados.descricao_porte].filter(Boolean).join(" — "),
        naturezaJuridica: natureza,
        capitalSocial: (dados.capital_social ?? 0).toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        }),
        regimeAtual,
      },
      cnaes,
    };
  });