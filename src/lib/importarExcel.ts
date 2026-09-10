import type { Parceiro, Regime } from "./estudo";
import { REGIMES } from "./estudo";

let contador = 0;
const novoId = () => `xls-${Date.now().toString(36)}-${(contador++).toString(36)}`;

function normalizarRegime(bruto: string): Regime {
  const t = (bruto ?? "").toString().toLowerCase();
  if (t.includes("simples")) return "Simples Nacional";
  if (t.includes("mei")) return "MEI";
  if (t.includes("presumido")) return "Lucro Presumido";
  if (t.includes("real")) return "Lucro Real";
  if (t.includes("normal")) return "Normal";
  if (t.includes("física") || t.includes("fisica") || t.includes("outro")) return "Outros (Pessoa Física)";
  const exato = REGIMES.find((r) => r.toLowerCase() === t);
  return exato ?? "Outros (Pessoa Física)";
}

const semAcento = (s: string) =>
  s
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

function paraNumero(v: unknown): number {
  if (typeof v === "number") return Number.isFinite(v) ? v : 0;
  if (typeof v !== "string") return 0;
  const limpo = v.replace(/\s|R\$/g, "").replace(/\./g, "").replace(",", ".");
  const n = Number.parseFloat(limpo);
  return Number.isFinite(n) ? n : 0;
}

type Linha = unknown[];

function acharCabecalho(linhas: Linha[]): { indice: number; cols: string[] } | null {
  for (let i = 0; i < Math.min(linhas.length, 20); i++) {
    const cols = (linhas[i] ?? []).map((c) => semAcento(String(c ?? "")));
    const temNome = cols.some((c) => c.includes("fornecedor") || c.includes("cliente"));
    const temValor = cols.some((c) => c.includes("valor"));
    if (temNome && temValor) return { indice: i, cols };
  }
  return null;
}

function extrairParceiros(linhas: Linha[]): Parceiro[] {
  const cab = acharCabecalho(linhas);
  if (!cab) return [];
  const { cols } = cab;
  const idx = (teste: (c: string) => boolean) => cols.findIndex(teste);
  const iNome = idx((c) => c.includes("fornecedor") || c.includes("cliente") || c === "nome");
  const iDoc = idx((c) => c.includes("cnpj") || c.includes("cpf"));
  const iValor = idx((c) => c.includes("valor"));
  const iRegime = idx((c) => c.includes("regime"));
  if (iNome < 0 || iValor < 0) return [];

  const mapa = new Map<string, Parceiro>();
  for (const linha of linhas.slice(cab.indice + 1)) {
    const nome = String(linha[iNome] ?? "").trim();
    if (!nome) continue;
    const valor = paraNumero(linha[iValor]);
    const doc = iDoc >= 0 ? String(linha[iDoc] ?? "").trim() : "";
    const regime = normalizarRegime(iRegime >= 0 ? String(linha[iRegime] ?? "") : "");
    const chave = `${doc || nome}|${regime}`;
    const atual = mapa.get(chave);
    if (atual) atual.valor += valor;
    else mapa.set(chave, { id: novoId(), nome, cnpj: doc, regime, valor });
  }
  return [...mapa.values()]
    .map((p) => ({ ...p, valor: Math.round(p.valor * 100) / 100 }))
    .filter((p) => p.valor > 0)
    .sort((a, b) => b.valor - a.valor);
}

function extrairFaturamento(linhas: Linha[]): number[] | null {
  for (let i = 0; i < Math.min(linhas.length, 20); i++) {
    const cols = (linhas[i] ?? []).map((c) => semAcento(String(c ?? "")));
    const iMes = cols.findIndex((c) => c === "mes" || c.startsWith("mes"));
    const iFat = cols.findIndex((c) => c.includes("faturamento") || c.includes("receita"));
    if (iMes < 0 || iFat < 0) continue;
    const meses = Array.from({ length: 12 }, () => 0);
    let algum = false;
    for (const linha of linhas.slice(i + 1)) {
      const m = Math.round(paraNumero(linha[iMes]));
      if (m < 1 || m > 12) continue;
      const v = paraNumero(linha[iFat]);
      meses[m - 1] = (meses[m - 1] ?? 0) + v;
      if (v > 0) algum = true;
    }
    if (algum) return meses;
  }
  return null;
}

/** Lê a planilha de regimes (abas de entradas/compras e vendas). */
export async function parsePlanilhaRegimes(
  file: File,
): Promise<{ clientes: Parceiro[]; fornecedores: Parceiro[]; faturamento: number[] | null }> {
  const XLSX = await import("xlsx");
  const buffer = await file.arrayBuffer();
  const wb = XLSX.read(buffer, { type: "array" });

  let clientes: Parceiro[] = [];
  let fornecedores: Parceiro[] = [];
  let faturamento: number[] | null = null;

  for (const nomeAba of wb.SheetNames) {
    const aba = wb.Sheets[nomeAba];
    if (!aba) continue;
    const linhas = XLSX.utils.sheet_to_json<Linha>(aba, { header: 1, raw: true, defval: "" });
    const itens = extrairParceiros(linhas);
    if (!itens.length) {
      faturamento = faturamento ?? extrairFaturamento(linhas);
      continue;
    }
    const n = semAcento(nomeAba);
    const cabecalho = acharCabecalho(linhas)?.cols.join(" ") ?? "";
    const ehCliente = n.includes("venda") || n.includes("cliente") || n.includes("saida") || cabecalho.includes("cliente");
    if (ehCliente) clientes = clientes.concat(itens);
    else fornecedores = fornecedores.concat(itens);
  }

  return { clientes, fornecedores, faturamento };
}
