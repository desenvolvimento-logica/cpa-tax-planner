import type { Cadastro, CnaeItem, Estudo, Parceiro, Regime, Simulacoes } from "./estudo";
import { REGIMES } from "./estudo";

export type TipoRelatorio =
  | "cnpj"
  | "faturamento"
  | "regimes"
  | "simulacao-reforma"
  | "planejamento"
  | "cnae"
  | "desconhecido";

export const ROTULO_TIPO: Record<TipoRelatorio, string> = {
  cnpj: "Consulta CNPJ (dados cadastrais)",
  faturamento: "Declaração de faturamento",
  regimes: "Perfil tributário de clientes e fornecedores",
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

export function parseFaturamento(texto: string): { faturamento: number[]; regimeAtual: string } {
  const faturamento = zeros();
  for (const linha of texto.split("\n")) {
    const semAcento = linha
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
    const idx = MESES_NOME.findIndex((mes) =>
      semAcento.trimStart().startsWith(mes.normalize("NFD").replace(/[\u0300-\u036f]/g, "")),
    );
    if (idx < 0) continue;
    const valores = linha.match(RX_VALOR);
    if (!valores?.length) continue;
    faturamento[idx] = num(valores[valores.length - 1] ?? "");
  }
  const regimeAtual = texto.match(/REGIME\s*:?\s*([^\n]+)/i)?.[1]?.trim() ?? "";
  return { faturamento, regimeAtual };
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
        const { faturamento, regimeAtual } = parseFaturamento(texto);
        const total = faturamento.reduce((a, b) => a + b, 0);
        estudo = {
          ...estudo,
          faturamento,
          cadastro: { ...estudo.cadastro, regimeAtual: regimeAtual || estudo.cadastro.regimeAtual },
        };
        resultados.push({
          nome: arquivo.name,
          tipo,
          resumo: `Total ${total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}`,
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
