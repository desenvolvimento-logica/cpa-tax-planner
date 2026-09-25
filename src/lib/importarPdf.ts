import type { Cadastro, CnaeItem, Estudo, Parceiro, Regime, Simulacoes } from "./estudo";
import { REGIMES } from "./estudo";
import { consultarCnpjPublico } from "./cnpj.functions";

export type TipoRelatorio =
  | "cnpj"
  | "faturamento"
  | "folha"
  | "regimes"
  | "memoria-calculo"
  | "simulacao-reforma"
  | "planejamento"
  | "cnae"
  | "desconhecido";

export const ROTULO_TIPO: Record<TipoRelatorio, string> = {
  cnpj: "Consulta CNPJ (dados cadastrais)",
  faturamento: "Declaração de faturamento",
  folha: "Resumo Mensal da folha",
  regimes: "Perfil tributário de clientes e fornecedores",
  "memoria-calculo": "Comparativo de regimes tributários — Memória de Cálculo",
  "simulacao-reforma": "Simulação da Reforma Tributária (Simples atual e híbrido)",
  planejamento: "Planejamento tributário (Lucro Presumido e Lucro Real)",
  cnae: "Consulta de CNAE",
  desconhecido: "Relatório não reconhecido",
};

/* ------------------------------------------------------------------ */
/* Extração de texto                                                   */
/* ------------------------------------------------------------------ */

/** Lê o PDF e devolve o texto preservando aproximadamente as colunas. */
export async function extrairTexto(file: File): Promise<string> {
  const pdfjs = await import("pdfjs-dist");
  const workerUrl = (await import("pdfjs-dist/build/pdf.worker.min.mjs?url")).default;
  pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;

  const buffer = await file.arrayBuffer();
  const doc = await pdfjs.getDocument({ data: buffer }).promise;
  const paginas: string[] = [];

  for (let p = 1; p <= doc.numPages; p++) {
    const page = await doc.getPage(p);
    const content = await page.getTextContent();
    type Peca = { x: number; y: number; w: number; texto: string };
    const pecas: Peca[] = [];
    for (const item of content.items as Array<{ str?: string; transform?: number[]; width?: number }>) {
      if (!item.str || !item.transform) continue;
      if (!item.str.trim()) continue;
      pecas.push({ x: item.transform[4] ?? 0, y: item.transform[5] ?? 0, w: item.width ?? 0, texto: item.str });
    }
    // agrupa por linha (mesma coordenada y, com tolerância)
    const linhas = new Map<number, Peca[]>();
    for (const peca of pecas) {
      const chave = Math.round(peca.y / 3);
      const lista = linhas.get(chave) ?? [];
      lista.push(peca);
      linhas.set(chave, lista);
    }
    const ordenadas = [...linhas.entries()].sort((a, b) => b[0] - a[0]);
    for (const [, lista] of ordenadas) {
      lista.sort((a, b) => a.x - b.x);
      let linha = "";
      let fim = lista[0]?.x ?? 0;
      for (const peca of lista) {
        const espacos = Math.max(0, Math.round((peca.x - fim) / 3.6));
        if (linha) linha += " ".repeat(Math.max(1, espacos));
        linha += peca.texto;
        fim = peca.x + peca.w;
      }
      paginas.push(linha);
    }
    paginas.push("");
  }
  return paginas.join("\n");
}

/* ------------------------------------------------------------------ */
/* Utilidades                                                          */
/* ------------------------------------------------------------------ */

const num = (s: string) => {
  const limpo = s.replace(/\./g, "").replace(",", ".").replace(/[^\d.-]/g, "");
  const v = Number.parseFloat(limpo);
  return Number.isFinite(v) ? v : 0;
};

const zeros = () => Array.from({ length: 12 }, () => 0);

const MESES_NOME = [
  "janeiro",
  "fevereiro",
  "março",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro",
];

const RX_VALOR = /-?\d{1,3}(?:\.\d{3})*,\d{2}/g;

let contador = 0;
const novoId = () => `imp-${Date.now().toString(36)}-${(contador++).toString(36)}`;

function normalizarRegime(bruto: string): Regime {
  const t = bruto.toLowerCase();
  if (t.includes("simples")) return "Simples Nacional";
  if (t.includes("mei")) return "MEI";
  if (t.includes("presumido")) return "Lucro Presumido";
  if (t.includes("real")) return "Lucro Real";
  if (t.includes("normal")) return "Normal";
  if (t.includes("física") || t.includes("fisica") || t.includes("outro")) return "Outros (Pessoa Física)";
  const exato = REGIMES.find((r) => r.toLowerCase() === t);
  return exato ?? "Outros (Pessoa Física)";
}

/* ------------------------------------------------------------------ */
/* Detecção                                                            */
/* ------------------------------------------------------------------ */

export function detectarTipo(texto: string, nome: string): TipoRelatorio {
  const t = texto.toLowerCase();
  const n = nome.toLowerCase();
  if (t.includes("cadastro nacional da pessoa jurídica") || t.includes("comprovante de inscrição")) return "cnpj";
  if (t.includes("declaração de faturamento")) return "faturamento";
  if (t.includes("resumo da folha") && t.includes("base total")) return "folha";
  if (t.includes("comparativo de regimes tributários") && t.includes("memória de cálculo")) return "memoria-calculo";
  if (t.includes("perfil tributário clientes e fornecedores")) return "regimes";
  if (t.includes("simulação reforma tributária")) return "simulacao-reforma";
  if (t.includes("planejamento tributário")) return "planejamento";
  if (t.includes("cnae") || n.includes("cnae")) return "cnae";
  return "desconhecido";
}

/* ------------------------------------------------------------------ */
/* Parsers                                                             */
/* ------------------------------------------------------------------ */

function depoisDe(linhas: string[], rotulo: string): string {
  const i = linhas.findIndex((l) => l.toUpperCase().includes(rotulo));
  if (i < 0) return "";
  for (let j = i + 1; j < Math.min(i + 4, linhas.length); j++) {
    const v = (linhas[j] ?? "").trim();
    if (v) return v;
  }
  return "";
}

export function parseCnpj(texto: string): { cadastro: Partial<Cadastro>; cnaes: CnaeItem[] } {
  const linhas = texto.split("\n");
  const cnpj = texto.match(/\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}/)?.[0] ?? "";
  const razaoSocial = depoisDe(linhas, "NOME EMPRESARIAL");
  const fantasiaLinha = depoisDe(linhas, "NOME DE FANTASIA");
  const partesFantasia = fantasiaLinha.split(/\s{2,}/);
  const abertura =
    texto.match(/DATA DE ABERTURA[\s\S]{0,400}?(\d{2}\/\d{2}\/\d{4})/i)?.[1] ??
    texto.match(/\d{2}\/\d{2}\/\d{4}/)?.[0] ??
    "";

  const natureza = depoisDe(linhas, "DESCRIÇÃO DA NATUREZA JUR");
  const situacaoLinha = depoisDe(linhas, "SITUAÇÃO CADASTRAL\n") || depoisDe(linhas, "MOTIVO DE SITUAÇÃO");
  const situacao = /ATIVA|BAIXADA|SUSPENSA|INAPTA/i.exec(texto)?.[0] ?? situacaoLinha;

  const logradouro = depoisDe(linhas, "LOGRADOURO").split(/\s{2,}/);
  const cepLinha = depoisDe(linhas, "BAIRRO/DISTRITO").split(/\s{2,}/);
  const endereco = [logradouro.slice(0, 3).join(", "), cepLinha.slice(0, 4).join(" — ")]
    .filter(Boolean)
    .join(" · ")
    .replace(/\s+/g, " ")
    .trim();

  const cnaes: CnaeItem[] = [];
  const rx = /(\d{2}\.\d{2}-\d-\d{2})\s*-\s*([^\n]+)/g;
  let m: RegExpExecArray | null;
  while ((m = rx.exec(texto))) {
    const codigo = m[1] ?? "";
    if (cnaes.some((c) => c.codigo === codigo)) continue;
    cnaes.push({
      id: novoId(),
      codigo,
      descricao: (m[2] ?? "").trim(),
      compreende: "",
      naoCompreende: "",
      anexo: "",
    });
  }

  return {
    cadastro: {
      razaoSocial,
      nomeFantasia: partesFantasia[0]?.trim() ?? "",
      cnpj,
      abertura,
      endereco,
      situacao,
      naturezaJuridica: natureza,
    },
    cnaes,
  };
}

const semAcentos = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

/** Declaração de Faturamento: uma linha por mês (M Ê S / ANO / Total R$). */
export function parseFaturamento(texto: string): { faturamento: number[]; regimeAtual: string; cnpj: string } {
  const faturamento = zeros();
  for (const linha of texto.split("\n")) {
    const plana = semAcentos(linha);
    // ignora cabeçalhos, período e a linha de totais
    if (/\btotais?\b|\bperiodo\b|\bm\s*e\s*s\b/.test(plana)) continue;
    const idx = MESES_NOME.findIndex((mes) => new RegExp(`\\b${semAcentos(mes)}\\b`).test(plana));
    if (idx < 0) continue;
    const valores = linha.match(RX_VALOR);
    if (!valores?.length) continue;
    faturamento[idx] = num(valores[valores.length - 1] ?? "");
  }
  const regimeAtual = texto.match(/REGIME\s*:?\s*([^\n]+)/i)?.[1]?.trim() ?? "";
  const cnpj = texto.match(/\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}/)?.[0] ?? "";
  return { faturamento, regimeAtual, cnpj };
}

/** Resumo Mensal: Base total da seção INSS, competência a competência. */
export function parseFolha(texto: string): number[] {
  const folha = zeros();
  const blocos = texto.split(/(?=Compet[eê]ncia\s*:)/i);
  for (const bloco of blocos) {
    const competencia = bloco.match(/Compet[eê]ncia\s*:\s*(\d{2})\/\d{4}/i);
    if (!competencia) continue;
    const mes = Number(competencia[1]) - 1;
    if (mes < 0 || mes > 11 || folha[mes] !== 0) continue;
    const secaoInss = bloco.match(/\bINSS\b[\s\S]*?Base total\s*:\s*(\d{1,3}(?:\.\d{3})*,\d{2})/i);
    if (secaoInss) folha[mes] = num(secaoInss[1] ?? "");
  }
  return folha;
}

const RX_MOEDA = /R\$\s*-?\d{1,3}(?:\.\d{3})*,\d{2}/g;

function somarTributos(linhas: Array<{ nome: string; valores: number[] }>) {
  const mapa = new Map<string, number>();
  for (const linha of linhas) {
    const valor = linha.valores.reduce((a, b) => a + b, 0);
    if (valor !== 0) mapa.set(linha.nome, (mapa.get(linha.nome) ?? 0) + valor);
  }
  return [...mapa].map(([nome, valor]) => ({ nome, valor }));
}

/**
 * Recompõe valores que o PDF quebrou: centavos na mesma linha ("R$ 15.595,0 8")
 * ou jogados para as linhas seguintes do mesmo bloco ("R$ 12.022,0" … "2").
 */
function repararBloco(bloco: string, preencherTracos = false): string {
  const linhas = bloco.split("\n");
  let principal = (linhas[0] ?? "").replace(/(R\$\s*[\d.]+,\d)\s+(\d)(?![\d,.%])/g, "$1$2");
  if (preencherTracos) principal = principal.replace(/(\s)—(?=\s|$)/g, "$1R$ 0,00");
  const sobras: string[] = [];
  for (const l of linhas.slice(1)) {
    for (const t of l.trim().split(/\s+/)) if (/^,?\d{1,2}$/.test(t)) sobras.push(t);
  }
  principal = principal.replace(/(R\$\s*\d{1,3}(?:\.\d{3})*)(,\d{0,2})?/g, (m, base: string, dec?: string) => {
    const sobra = sobras[0];
    if (dec === undefined) {
      // valor sem vírgula: os centavos vieram na linha de baixo (",35")
      if (!sobra || !/^,\d{2}$/.test(sobra)) return m;
      sobras.shift();
      return base + sobra;
    }
    const faltam = 3 - dec.length;
    if (faltam === 0) return m;
    if (!sobra || sobra.startsWith(",") || sobra.length !== faltam) return m;
    sobras.shift();
    return base + dec + sobra;
  });
  return principal;
}

/**
 * Uma linha de valores por competência. Quando o mês tem mais de uma tributação
 * (ex.: dois Anexos), usa a linha "soma do mês"; caso contrário, a linha única.
 */
function linhasMensais(secao: string, preencherTracos = false): number[][] {
  const blocos = secao
    .split(/(?=^\s*\d{2}\/\d{4}\b)/m)
    .filter((bloco) => /^\s*\d{2}\/\d{4}/.test(bloco));
  const porMes = new Map<string, { soma?: number[]; linhas: number[][] }>();
  for (const bloco of blocos) {
    const comp = bloco.trim().slice(0, 7);
    const valores = (repararBloco(bloco.trim(), preencherTracos).match(RX_MOEDA) ?? []).map(num);
    const item = porMes.get(comp) ?? { linhas: [] };
    if (/^\s*\d{2}\/\d{4}[ \t]*—/.test(bloco) || /soma do/i.test(bloco.split("\n").slice(0, 2).join(" "))) item.soma = valores;
    else item.linhas.push(valores);
    porMes.set(comp, item);
  }
  return [...porMes.values()].map((i) => {
    if (i.soma) return i.soma;
    if (i.linhas.length <= 1) return i.linhas[0] ?? [];
    // sem linha de soma: soma coluna a coluna
    const n = Math.max(...i.linhas.map((l) => l.length));
    return Array.from({ length: n }, (_, k) => i.linhas.reduce((a, l) => a + (l[k] ?? 0), 0));
  });
}

/** Cabeçalho da seção (antes da primeira competência). */
const cabecalho = (secao: string) => secao.split(/^\s*\d{2}\/\d{4}\b/m)[0] ?? "";

/** Memória de Cálculo: comparativo mensal completo dos quatro regimes. */
export function parseMemoriaCalculo(textoOriginal: string): Simulacoes {
  const texto = textoOriginal;
  const separar = (inicio: RegExp, fim?: RegExp) => {
    const i = texto.search(inicio);
    if (i < 0) return "";
    const restante = texto.slice(i);
    const j = fim ? restante.slice(1).search(fim) : -1;
    return j >= 0 ? restante.slice(0, j + 1) : restante;
  };
  const secAtual = separar(/1\.\s*Simples Nacional Atual/i, /2\.\s*Simples Nacional H[ií]brido/i);
  const secHibrido = separar(/2\.\s*Simples Nacional H[ií]brido/i, /3\.\s*Lucro Presumido/i);
  const secPresumido = separar(/3\.\s*Lucro Presumido/i, /4\.\s*Lucro Real/i);
  const secReal = separar(/4\.\s*Lucro Real/i);
  // Comércio/indústria (Anexo I/II): colunas de ICMS e, no Anexo II, IPI.
  const comIcms = (sec: string) => /ICMS/.test(cabecalho(sec));
  const comIpi = (sec: string) => /\bIPI\b/.test(cabecalho(sec));
  const comercio = comIcms(secAtual) || comIcms(secHibrido) || comIcms(secPresumido);
  const atuais = linhasMensais(secAtual, comercio);
  const hibridos = linhasMensais(secHibrido);
  const presumidos = linhasMensais(secPresumido, comercio);
  const reais = linhasMensais(secReal, comercio);
  const mensal = (linhas: number[][], indice: (valores: number[]) => number) => {
    const valores = zeros();
    linhas.slice(0, 12).forEach((linha, i) => { valores[i] = indice(linha); });
    return valores;
  };

  // Simples Atual: colunas na ordem do cabeçalho (índice 0 = receita).
  let colunasAtual = ["IRPJ", "CSLL", "COFINS", "PIS", "INSS/CPP", "ISS", "Total DAS"];
  if (comercio) {
    const linhaCab = cabecalho(secAtual).split("\n").find((l) => /Total DAS/i.test(l)) ?? "";
    const achados = linhaCab.match(/IRPJ|CSLL|COFINS|PIS|INSS\/CPP|ICMS|IPI|ISS|Total DAS/g);
    if (achados?.includes("Total DAS")) colunasAtual = achados;
  }
  const idxAtual = (nome: string) => colunasAtual.indexOf(nome) + 1;
  const atualTributos = somarTributos(
    colunasAtual
      .filter((n) => n !== "Total DAS")
      .map((nome) => ({ nome, valores: atuais.map((v) => v[idxAtual(nome)] ?? 0) })),
  );

  // Localiza o DAS Híbrido como o valor que é a soma dos tributos anteriores
  // (IRPJ + CSLL + INSS/CPP + ISS, ou ICMS/IPI no comércio). CBS líquido = Total − DAS.
  const nomesDas = comIcms(secHibrido)
    ? ["IRPJ", "CSLL", "INSS/CPP", "ICMS", ...(comIpi(secHibrido) ? ["IPI"] : [])]
    : ["IRPJ", "CSLL", "INSS/CPP", "ISS"];
  const k = nomesDas.length;
  const partesHibrido = hibridos.map((v) => {
    for (let i = k; i < v.length; i++) {
      const partes = v.slice(i - k, i);
      const somaPartes = partes.reduce((x, y) => x + y, 0);
      if (v[i]! > 0 && Math.abs(somaPartes - v[i]!) <= 0.05) {
        const total = v.at(-1) ?? 0;
        return { partes, cbs: Math.max(0, Math.round((total - v[i]!) * 100) / 100) };
      }
    }
    return { partes: nomesDas.map(() => 0), cbs: 0 };
  });
  const hibridoTributos = somarTributos([
    ...nomesDas.map((nome, j) => ({ nome, valores: partesHibrido.map((p) => p.partes[j] ?? 0) })),
    { nome: "CBS", valores: partesHibrido.map((p) => p.cbs) },
  ]);

  const tributosServico = (linhas: number[][], real: boolean) => somarTributos([
    { nome: "ISS", valores: linhas.map((v) => v[2] ?? 0) },
    { nome: "INSS/CPP", valores: linhas.map((v) => v[3] ?? 0) },
    { nome: "CBS", valores: linhas.map((v) => v[6] ?? 0) },
    { nome: "IRPJ", valores: linhas.map((v) => real ? (v.length >= 12 ? v[8] ?? 0 : 0) : (v.length >= 11 ? v[7] ?? 0 : 0)) },
    { nome: "Adicional IRPJ", valores: linhas.map((v) => real ? (v.length >= 12 ? v[9] ?? 0 : 0) : (v.length >= 11 ? v[8] ?? 0 : 0)) },
    { nome: "CSLL", valores: linhas.map((v) => real ? (v.length >= 12 ? v[10] ?? 0 : 0) : (v.length >= 11 ? v[9] ?? 0 : 0)) },
  ]);
  // Comércio: Receita, Folha, ICMS (déb/créd/líq), [IPI (déb/créd/líq)], CPP,
  // CBS (bruto/créd/líq), [Resultado DRE], IRPJ, Adicional, CSLL, Total.
  const tributosComercio = (linhas: number[][], sec: string, real: boolean) => {
    const cols = ["rec", "folha", "icmsD", "icmsC", "ICMS", ...(comIpi(sec) ? ["ipiD", "ipiC", "IPI"] : []),
      "INSS/CPP", "cbsB", "cbsC", "CBS", ...(real ? ["res"] : []), "IRPJ", "Adicional IRPJ", "CSLL", "total"];
    const col = (n: string) => cols.indexOf(n);
    return somarTributos(
      ["ICMS", "IPI", "INSS/CPP", "CBS", "IRPJ", "Adicional IRPJ", "CSLL"]
        .filter((n) => col(n) >= 0)
        .map((nome) => ({ nome, valores: linhas.map((v) => (v.length === cols.length ? v[col(nome)] ?? 0 : 0)) })),
    );
  };
  const tributosRegular = (linhas: number[][], sec: string, real: boolean) =>
    comIcms(sec) ? tributosComercio(linhas, sec, real) : tributosServico(linhas, real);

  return {
    simplesAtual: mensal(atuais, (v) => v[idxAtual("Total DAS")] ?? 0),
    simplesHibrido: mensal(hibridos, (v) => v.at(-1) ?? 0),
    lucroPresumido: mensal(presumidos, (v) => v.at(-1) ?? 0),
    lucroReal: mensal(reais, (v) => v.at(-1) ?? 0),
    tributos: {
      simplesAtual: atualTributos,
      simplesHibrido: hibridoTributos,
      lucroPresumido: tributosRegular(presumidos, secPresumido, false),
      lucroReal: tributosRegular(reais, secReal, true),
    },
  };
}


export function parseRegimes(texto: string): { clientes: Parceiro[]; fornecedores: Parceiro[] } {
  const clientes: Parceiro[] = [];
  const fornecedores: Parceiro[] = [];
  let alvo: Parceiro[] | null = null;

  const rxDoc = /(\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}|\d{3}\.\d{3}\.\d{3}-\d{2})/;
  const rxRegime = /(Simples Nacional|Lucro Presumido|Lucro Real|Normal|MEI|Outros[^\d]*)/i;

  for (const linha of texto.split("\n")) {
    const cru = linha.trim();
    const alto = cru.toUpperCase();
    if (/^CLIENTES\b/.test(alto) || alto.endsWith(" CLIENTES")) alvo = clientes;
    else if (/^FORNECEDORES\b/.test(alto) || alto.endsWith(" FORNECEDORES")) alvo = fornecedores;
    if (!alvo) continue;
    if (/^total/i.test(cru)) continue;

    const doc = rxDoc.exec(cru);
    if (!doc) continue;
    const antes = cru.slice(0, doc.index);
    const depois = cru.slice(doc.index + doc[0].length);
    const regimeM = rxRegime.exec(depois);
    if (!regimeM) continue;
    const valores = depois.match(RX_VALOR);
    if (!valores?.length) continue;

    const nome = antes
      .replace(/^\s*\d+\s+/, "")
      .replace(/^\s*\d+\s+/, "")
      .replace(/\s{2,}/g, " ")
      .trim();
    if (!nome) continue;

    alvo.push({
      id: novoId(),
      nome,
      cnpj: doc[0],
      regime: normalizarRegime(regimeM[1] ?? ""),
      valor: num(valores[0] ?? ""),
    });
  }
  return { clientes, fornecedores };
}

/** Simulação da Reforma Tributária: 1ª FASE 2027, mês a mês (Simples atual). */
export function parseSimulacaoReforma(texto: string): Pick<Simulacoes, "simplesAtual" | "tributos"> {
  const simplesAtual = zeros();
  const NOMES_ATUAIS = ["IRPJ", "CSLL", "INSS/CPP", "IPI", "ICMS", "ISS", "PIS/Pasep", "COFINS"];
  const somaAtuais = NOMES_ATUAIS.map(() => 0);
  const linhas = texto.split("\n");
  let mes = -1;
  let esperando = false;

  for (const linha of linhas) {
    const periodo = linha.match(/Per[ií]odo:\s*(\d{2})\/(\d{4})/);
    if (periodo) {
      mes = Number(periodo[1]) - 1;
      continue;
    }
    if (/1[ªa]\s*FASE\s*2027/i.test(linha)) {
      esperando = true;
      continue;
    }
    if (/2[ªa]\s*FASE/i.test(linha)) {
      esperando = false;
      continue;
    }
    if (!esperando || mes < 0) continue;
    const valores = linha.match(RX_VALOR);
    if (!valores || valores.length < 12) continue;
    // colunas: 8 tributos atuais + Total(8)
    simplesAtual[mes] = num(valores[8] ?? "");
    NOMES_ATUAIS.forEach((_, i) => {
      somaAtuais[i] = (somaAtuais[i] ?? 0) + num(valores[i] ?? "");
    });
    esperando = false;
  }
  return {
    simplesAtual,
    tributos: {
      simplesAtual: NOMES_ATUAIS.map((nome, i) => ({ nome, valor: somaAtuais[i] ?? 0 })).filter((t) => t.valor !== 0),
    },
  };
}


/** Planejamento Tributário: Simples Híbrido, Lucro Presumido e Lucro Real do ano de 2027. */
export function parsePlanejamento(
  texto: string,
): Pick<Simulacoes, "simplesHibrido" | "lucroPresumido" | "lucroReal" | "tributos"> {
  const pegar = (rotulo: RegExp) => {
    for (const linha of texto.split("\n")) {
      if (!rotulo.test(linha.trim())) continue;
      const valores = linha.match(RX_VALOR);
      if (!valores || valores.length < 13) continue;
      return valores.slice(0, 12).map(num);
    }
    return zeros();
  };
  const tributosDe = (rotulo: RegExp) => {
    const linhas = texto.split("\n");
    const inicio = linhas.findIndex((l) => rotulo.test(l));
    if (inicio < 0) return [];
    const itens: { nome: string; valor: number }[] = [];
    for (const linha of linhas.slice(inicio + 1)) {
      const cru = linha.trim();
      if (/^DETALHAMENTO/i.test(cru)) break;
      if (/^total\b/i.test(cru)) break;
      const valores = cru.match(RX_VALOR);
      if (!valores || valores.length < 13) continue;
      const nome = cru.slice(0, cru.indexOf(valores[0] ?? "")).trim();
      if (!nome || /^tributos/i.test(nome)) continue;
      itens.push({ nome, valor: num(valores[valores.length - 1] ?? "") });
    }
    return itens;
  };

  // O modelo híbrido corresponde à linha "Simples Nacional" do planejamento:
  // Anexo do Simples (sem PIS/COFINS) + tributos apurados no regime regular (CBS/IBS).
  const hibridoAnexo = tributosDe(/DETALHAMENTO SIMPLES NACIONAL \(ANEXO/i);
  const hibridoRegular = tributosDe(/DETALHAMENTO SIMPLES NACIONAL - IMPOSTOS CALCULADOS NO REGIME REGULAR/i);
  const somar = (itens: { nome: string; valor: number }[]) => {
    const mapa = new Map<string, number>();
    for (const it of itens) mapa.set(it.nome, (mapa.get(it.nome) ?? 0) + it.valor);
    return [...mapa].map(([nome, valor]) => ({ nome, valor })).filter((t) => t.valor !== 0);
  };

  return {
    simplesHibrido: pegar(/^Simples Nacional\b/i),
    lucroPresumido: pegar(/^Lucro Presumido\b/i),
    lucroReal: pegar(/^Lucro Real\b/i),
    tributos: {
      simplesHibrido: somar([...hibridoAnexo, ...hibridoRegular]),
      lucroPresumido: tributosDe(/DETALHAMENTO LUCRO PRESUMIDO/i),
      lucroReal: tributosDe(/DETALHAMENTO LUCRO REAL/i),
    },
  };
}


/** Consulta de CNAE: compreende / não compreende para um código. */
export function parseCnae(texto: string): { codigo: string; compreende: string; naoCompreende: string; anexo: string } {
  const bruto =
    texto.match(/\d{2}\.\d{2}-\d[-/]\d{2}/)?.[0] ?? texto.match(/\d{4}-\d[-/]\d{2}/)?.[0] ?? "";
  const digitos = bruto.replace(/\D/g, "");
  const codigo =
    digitos.length === 7 ? `${digitos.slice(0, 2)}.${digitos.slice(2, 4)}-${digitos[4]}-${digitos.slice(5)}` : bruto;
  const anexo = texto.match(/Anexo\s+(III|IV|II|I|V)\b/i)?.[0] ?? "";

  const linhas = texto.split("\n");
  const compreende: string[] = [];
  const naoCompreende: string[] = [];
  let dentro = false;
  let modo: "c" | "n" = "c";

  for (const linha of linhas) {
    const baixo = linha.toLowerCase();
    if (!dentro) {
      if (baixo.includes("não compreende") && baixo.includes("compreende")) dentro = true;
      continue;
    }
    if (/constitui[çc][ãa]o da empresa|obriga[çc][õo]es acess|econeteditora|^\s*https?:/i.test(baixo)) break;
    const texto0 = linha.trim();
    if (!texto0) continue;
    if (/^esta subclasse não compreende/i.test(texto0)) {
      modo = "n";
      continue;
    }
    if (/^esta subclasse compreende/i.test(texto0)) {
      modo = "c";
      continue;
    }
    const destino = modo === "c" ? compreende : naoCompreende;
    const item = texto0.replace(/^[-•]+\s*/, "");
    if (/^[-•]/.test(texto0) || destino.length === 0) destino.push(item);
    else destino[destino.length - 1] = `${destino[destino.length - 1]} ${item}`;
  }


  return {
    codigo,
    anexo,
    compreende: compreende.join("\n").trim(),
    naoCompreende: naoCompreende.join("\n").trim(),
  };
}


/* ------------------------------------------------------------------ */
/* Aplicação no estudo                                                 */
/* ------------------------------------------------------------------ */

export type ResultadoArquivo = {
  nome: string;
  tipo: TipoRelatorio;
  resumo: string;
  ok: boolean;
};

export async function importarArquivos(
  arquivos: File[],
  base: Estudo,
): Promise<{ estudo: Estudo; resultados: ResultadoArquivo[] }> {
  let estudo: Estudo = {
    ...base,
    cadastro: { ...base.cadastro },
    simulacoes: { ...base.simulacoes },
    cnaes: [...base.cnaes],
  };
  const resultados: ResultadoArquivo[] = [];

  for (const arquivo of arquivos) {
    if (/\.(xlsx|xlsm|xls|csv)$/i.test(arquivo.name)) {
      try {
        const { parsePlanilhaRegimes } = await import("./importarExcel");
        const { clientes, fornecedores, tributacoesNacionais, resumoNcm } = await parsePlanilhaRegimes(arquivo);
        const tributacoesMescladas = tributacoesNacionais.map((item) => {
          const existente = estudo.tributacoesNacionais.find((atual) => atual.codigo === item.codigo);
          return existente?.aliquotaIss ? { ...item, aliquotaIss: existente.aliquotaIss } : item;
        });
        // O faturamento mensal vem exclusivamente da Declaração de Faturamento (PDF).
        estudo = {
          ...estudo,
          clientes: clientes.length ? clientes : estudo.clientes,
          fornecedores: fornecedores.length ? fornecedores : estudo.fornecedores,
          tributacoesNacionais: tributacoesMescladas.length ? tributacoesMescladas : estudo.tributacoesNacionais,
          resumoNcm: resumoNcm.length ? resumoNcm : (estudo.resumoNcm ?? []),
        };
        resultados.push({
          nome: arquivo.name,
          tipo: "regimes",
          resumo: `${clientes.length} cliente(s) · ${fornecedores.length} fornecedor(es)${tributacoesNacionais.length ? ` · ${tributacoesNacionais.length} código(s) tributário(s)` : ""}${resumoNcm.length ? ` · ${resumoNcm.length} grupo(s) NCM/cClassTrib` : ""}`,
          ok: clientes.length + fornecedores.length + tributacoesNacionais.length + resumoNcm.length > 0,
        });
      } catch {
        resultados.push({ nome: arquivo.name, tipo: "regimes", resumo: "Não foi possível ler a planilha.", ok: false });
      }
      continue;
    }

    let texto = "";
    try {
      texto = await extrairTexto(arquivo);
    } catch {
      resultados.push({ nome: arquivo.name, tipo: "desconhecido", resumo: "Não foi possível ler o arquivo.", ok: false });
      continue;
    }
    const tipo = detectarTipo(texto, arquivo.name);

    try {
      if (tipo === "cnpj") {
        const { cadastro, cnaes } = parseCnpj(texto);
        const existentes = estudo.cnaes;
        const mesclados = cnaes.map((c) => {
          const antigo = existentes.find((e) => e.codigo === c.codigo);
          return antigo ? { ...antigo, descricao: c.descricao || antigo.descricao } : c;
        });
        estudo = { ...estudo, cadastro: { ...estudo.cadastro, ...cadastro }, cnaes: mesclados };
        resultados.push({
          nome: arquivo.name,
          tipo,
          resumo: `${cadastro.razaoSocial || "empresa"} · ${cnaes.length} CNAE(s)`,
          ok: true,
        });
      } else if (tipo === "faturamento") {
        const { faturamento, regimeAtual, cnpj } = parseFaturamento(texto);
        const total = faturamento.reduce((a, b) => a + b, 0);
        let cadastroConsultado = false;
        let avisoConsulta = "";
        let cadastro = { ...estudo.cadastro, regimeAtual: regimeAtual || estudo.cadastro.regimeAtual };
        let cnaes = estudo.cnaes;
        if (cnpj) {
          try {
            const consulta = await consultarCnpjPublico({ data: { cnpj } });
            cadastro = { ...cadastro, ...consulta.cadastro, regimeAtual: regimeAtual || consulta.cadastro.regimeAtual || cadastro.regimeAtual };
            cnaes = consulta.cnaes.map((item) => {
              const existente = estudo.cnaes.find((c) => c.codigo.replace(/\D/g, "") === item.codigo.replace(/\D/g, ""));
              return existente
                ? {
                    ...item,
                    id: existente.id,
                    compreende: item.compreende || existente.compreende,
                    naoCompreende: item.naoCompreende || existente.naoCompreende,
                    anexo: item.anexo || existente.anexo,
                  }
                : item;
            });
            cadastroConsultado = true;
          } catch {
            cadastro = { ...cadastro, cnpj: cadastro.cnpj || cnpj };
            avisoConsulta = " · cadastro público indisponível";
          }
        }
        estudo = {
          ...estudo,
          faturamento,
          cadastro,
          cnaes,
        };
        resultados.push({
          nome: arquivo.name,
          tipo,
          resumo: `Total ${total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}${
            cadastroConsultado ? ` · cadastro e ${cnaes.length} CNAE(s) consultados` : avisoConsulta
          }`,
          ok: total > 0,
        });
      } else if (tipo === "regimes") {
        const { clientes, fornecedores } = parseRegimes(texto);
        estudo = {
          ...estudo,
          clientes: clientes.length ? clientes : estudo.clientes,
          fornecedores: fornecedores.length ? fornecedores : estudo.fornecedores,
        };
        resultados.push({
          nome: arquivo.name,
          tipo,
          resumo: `${clientes.length} cliente(s) · ${fornecedores.length} fornecedor(es)`,
          ok: clientes.length + fornecedores.length > 0,
        });
      } else if (tipo === "folha") {
        const folha = parseFolha(texto);
        const meses = folha.filter((v) => v > 0).length;
        const total = folha.reduce((a, b) => a + b, 0);
        estudo = { ...estudo, folha };
        resultados.push({
          nome: arquivo.name,
          tipo,
          resumo: `${meses} mês(es) · total ${total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}`,
          ok: meses > 0,
        });
      } else if (tipo === "memoria-calculo") {
        const simulacoes = parseMemoriaCalculo(texto);
        const meses = simulacoes.simplesAtual.filter((v) => v > 0).length;
        estudo = { ...estudo, simulacoes };
        resultados.push({ nome: arquivo.name, tipo, resumo: `${meses} mês(es) · 4 regimes preenchidos`, ok: meses > 0 });
      } else if (tipo === "simulacao-reforma") {
        const parcial = parseSimulacaoReforma(texto);
        estudo = {
          ...estudo,
          simulacoes: {
            ...estudo.simulacoes,
            ...parcial,
            tributos: { ...estudo.simulacoes.tributos, ...parcial.tributos },
          },
        };
        const meses = parcial.simplesAtual.filter((v) => v > 0).length;
        resultados.push({ nome: arquivo.name, tipo, resumo: `${meses} mês(es) de 2027 preenchidos`, ok: meses > 0 });
      } else if (tipo === "planejamento") {
        const parcial = parsePlanejamento(texto);
        estudo = {
          ...estudo,
          simulacoes: {
            ...estudo.simulacoes,
            ...parcial,
            tributos: { ...estudo.simulacoes.tributos, ...parcial.tributos },
          },
        };
        const meses = parcial.lucroPresumido.filter((v) => v > 0).length;
        resultados.push({ nome: arquivo.name, tipo, resumo: `${meses} mês(es) de 2027 preenchidos`, ok: meses > 0 });
      } else if (tipo === "cnae") {
        const dados = parseCnae(texto);
        const cnaes = estudo.cnaes.map((c) =>
          c.codigo.replace(/\D/g, "") === dados.codigo.replace(/\D/g, "")
            ? {
                ...c,
                compreende: dados.compreende || c.compreende,
                naoCompreende: dados.naoCompreende || c.naoCompreende,
                anexo: c.anexo || dados.anexo,
              }
            : c,
        );
        const achou = cnaes.some((c) => c.codigo.replace(/\D/g, "") === dados.codigo.replace(/\D/g, ""));
        estudo = { ...estudo, cnaes };
        resultados.push({
          nome: arquivo.name,
          tipo,
          resumo: achou ? `CNAE ${dados.codigo} atualizado` : `CNAE ${dados.codigo} não está no cadastro`,
          ok: achou,
        });
      } else {
        resultados.push({ nome: arquivo.name, tipo, resumo: "Formato não identificado.", ok: false });
      }
    } catch {
      resultados.push({ nome: arquivo.name, tipo, resumo: "Erro ao interpretar o relatório.", ok: false });
    }
  }

  return { estudo, resultados };
}
