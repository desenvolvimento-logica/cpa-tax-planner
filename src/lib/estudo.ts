export const ALIQUOTA_IBS = 0.187;
export const ALIQUOTA_CBS = 0.0921;

export const REGIMES = [
  "Normal",
  "Lucro Real",
  "Lucro Presumido",
  "Simples Nacional",
  "MEI",
  "Outros (Pessoa Física)",
] as const;

export type Regime = (typeof REGIMES)[number];

/** Regimes que geram crédito de IBS/CBS para o adquirente. */
export const REGIMES_COM_CREDITO: Regime[] = ["Normal", "Lucro Real", "Lucro Presumido"];


export const MESES = [
  "Jan",
  "Fev",
  "Mar",
  "Abr",
  "Mai",
  "Jun",
  "Jul",
  "Ago",
  "Set",
  "Out",
  "Nov",
  "Dez",
] as const;

export type Cadastro = {
  razaoSocial: string;
  nomeFantasia: string;
  cnpj: string;
  abertura: string;
  endereco: string;
  situacao: string;
  naturezaJuridica: string;
  regimeAtual: string;
  capitalSocial: string;
};

export type CnaeItem = {
  id: string;
  codigo: string;
  descricao: string;
  compreende: string;
  naoCompreende: string;
  anexo: string;
};

export type ResumoNcm = {
  ncm: string;
  descricao: string;
  cst: string;
  cClassTrib: string;
  itens: number;
  valor: number;
};

export type TributacaoNacional = {
  id: string;
  codigo: string;
  descricao: string;
  aliquotaIss: number;
};

export type Parceiro = {
  id: string;
  nome: string;
  cnpj: string;
  regime: Regime;
  valor: number;
  /** IBS informado na planilha (débito/crédito). Sem valor, calcula-se pela alíquota. */
  ibs?: number | undefined;
  /** CBS informado na planilha (débito/crédito). Sem valor, calcula-se pela alíquota. */
  cbs?: number | undefined;
};

export const ibsDe = (p: Parceiro) => p.ibs ?? p.valor * ALIQUOTA_IBS;
export const cbsDe = (p: Parceiro) => p.cbs ?? p.valor * ALIQUOTA_CBS;

export type CenarioKey = "simplesAtual" | "simplesHibrido" | "lucroPresumido" | "lucroReal";

export type TributoLinha = { nome: string; valor: number };

export const ORDEM_TRIBUTOS = [
  "IRPJ",
  "Adicional IRPJ",
  "CSLL",
  "INSS/CPP",
  "ISS",
  "ICMS",
  "IPI",
  "PIS/Pasep",
  "COFINS",
  "CBS",
] as const;

/** Só aparecem quando a empresa tem valor (comércio/indústria). */
export const TRIBUTOS_OPCIONAIS = new Set<string>(["ICMS", "IPI"]);

const normalizarNomeTributo = (nome: string) => {
  const chave = nome.toLowerCase().replace(/\s+/g, " ").trim();
  if (chave === "pis" || chave === "pis/pasep") return "PIS/Pasep";
  if (chave.includes("adicional") && chave.includes("irpj")) return "Adicional IRPJ";
  if (chave.includes("inss") || chave === "cpp") return "INSS/CPP";
  if (chave.startsWith("cbs")) return "CBS";
  return nome;
};

export function ordenarTributos(tributos: TributoLinha[]): TributoLinha[] {
  const consolidados = new Map<string, number>();
  for (const tributo of tributos) {
    const nome = normalizarNomeTributo(tributo.nome);
    consolidados.set(nome, (consolidados.get(nome) ?? 0) + tributo.valor);
  }
  return ORDEM_TRIBUTOS.map((nome) => ({ nome, valor: consolidados.get(nome) ?? 0 })).filter(
    (t) => !TRIBUTOS_OPCIONAIS.has(t.nome) || t.valor !== 0,
  );
}

export type Simulacoes = {
  simplesAtual: number[];
  simplesHibrido: number[];
  lucroPresumido: number[];
  lucroReal: number[];
  tributos?: Partial<Record<CenarioKey, TributoLinha[]>>;
};


export type Diagnostico = {
  tituloCapa: string;
  chamadaCapa: string;
  subtituloCapa: string;
  anoBase: string;
  emitidoEm: string;
  confidencial: string;
  telefone: string;
  email: string;
  site: string;
  endereco: string;
  saudacao: string;
  introducao: string;
  oQueMuda: string;
  prazos: string;
  orientacaoTitulo: string;
  orientacao: string;
  proximosPassos: string;
  pacote: string;
  encerramento: string;
};

export type Estudo = {
  escritorio: string;
  cadastro: Cadastro;
  cnaes: CnaeItem[];
  faturamento: number[];
  tributacoesNacionais: TributacaoNacional[];
  resumoNcm?: ResumoNcm[];
  folha: number[];
  fornecedores: Parceiro[];
  clientes: Parceiro[];
  simulacoes: Simulacoes;
  observacoes: string;
  diagnostico: Diagnostico;
};

export const CENARIOS = [
  { key: "simplesAtual", label: "Simples Nacional — atual", fonte: "Comparativo de regimes tributários — Memória de Cálculo" },
  { key: "simplesHibrido", label: "Simples Nacional — modelo híbrido", fonte: "Comparativo de regimes tributários — Memória de Cálculo" },
  { key: "lucroPresumido", label: "Lucro Presumido", fonte: "Comparativo de regimes tributários — Memória de Cálculo" },
  { key: "lucroReal", label: "Lucro Real", fonte: "Comparativo de regimes tributários — Memória de Cálculo" },
] as const satisfies ReadonlyArray<{ key: CenarioKey; label: string; fonte: string }>;

const zeros = () => Array.from({ length: 12 }, () => 0);


export const diagnosticoPadrao: Diagnostico = {
  tituloCapa: "Orientação exclusiva ao cliente",
  chamadaCapa: "Diagnóstico preliminar de orientação ao cliente",
  subtituloCapa: "Preparado para",
  anoBase: "2026",
  emitidoEm: "",
  confidencial: "Documento confidencial — uso exclusivo do destinatário",
  telefone: "(19) 3825-5196",
  email: "tributario@escritoriologica.com.br",
  site: "escritoriologica.cnt.br",
  endereco:
    "Av. Eng. Fábio Roberto Barnabé, 1942 — Jd. Esplanada — Indaiatuba/SP — 13.331-520",
  saudacao: "Olá, cliente amigo.",
  introducao:
    "Você certamente já ouviu falar da Reforma Tributária — a maior mudança do sistema de impostos do Brasil nas últimas décadas. Ela substitui gradualmente PIS, Cofins, ICMS e ISS por dois novos tributos, a CBS (federal) e o IBS (estadual e municipal), e muda a forma como as empresas se relacionam entre si na hora de comprar e de vender.\n\nAqui na Lógica, nós não esperamos as mudanças chegarem: nos antecipamos a elas. Por isso, analisamos os documentos fiscais da sua empresa e preparamos este diagnóstico exclusivo — um cuidado a mais com quem confia o seu negócio a nós, para que você decida com tranquilidade e antes de os prazos apertarem.\n\nNas próximas páginas, você vai entender o que a reforma significa para o perfil da sua empresa, o que encontramos na análise e qual é a nossa orientação.",
  oQueMuda:
    "A partir de 2027, a CBS passa a ser cobrada de forma plena e o IBS entra em transição. O novo sistema é de crédito amplo: cada empresa do regime regular desconta, do que tem a pagar, o valor dos tributos que veio destacado nas suas compras. Na prática, essas empresas passarão a preferir fornecedores capazes de transferir esse crédito por inteiro.\n\nA empresa optante pelo Simples Nacional continua no regime favorecido, mas ganha uma escolha nova: manter a CBS e o IBS dentro do recolhimento único (situação em que o crédito repassado ao cliente é apenas o valor efetivamente contido na guia, bem menor) ou optar por apurar e recolher CBS e IBS pelo regime regular — o chamado Simples Híbrido. Nessa opção, o Simples continua valendo para IRPJ, CSLL, CPP e demais tributos, enquanto CBS e IBS passam a ser calculados à alíquota cheia, com direito a tomar crédito das próprias compras e a repassar crédito integral aos clientes.\n\nA escolha é irreversível dentro do período em que produz efeitos e vale para a empresa como um todo, não por cliente ou por nota. Não existe resposta única: o melhor caminho depende de quem são os seus clientes e os seus fornecedores — e foi exatamente isso que analisamos para você.",
  prazos:
    "A janela de opção pelo regime regular de CBS e IBS para o primeiro semestre de 2027 é de 1º a 30 de setembro de 2026. Quem não se manifestar nesse período permanece, por padrão, com CBS e IBS dentro do recolhimento único do Simples.\n\nA solicitação de cancelamento dessa opção pode ser feita até o último dia de novembro de 2026. Encerrada essa fase, a permanência no regime passa a ser reavaliada em janelas semestrais, sempre com antecedência em relação ao período de apuração.\n\nO tempo para analisar, simular e decidir é curto — e a decisão precisa estar apoiada em números, não em impressões.",
  orientacaoTitulo: "Nossa orientação: é aconselhável a mudança para o Simples Nacional Híbrido",
  orientacao:
    "A análise mostrou que a maior parte do faturamento da sua empresa vem de clientes do regime regular — empresas que, com a reforma, passarão a dar preferência a fornecedores capazes de transferir o crédito integral de CBS e IBS. Permanecer no recolhimento único significaria entregar a esses clientes um crédito muito menor do que o dos seus concorrentes, com pressão direta sobre preço e renovação de contratos.\n\nPor outro lado, o Simples Híbrido eleva a carga nominal de CBS e IBS e exige disciplina de documentação fiscal nas compras, já que o crédito só existe quando a operação está devidamente documentada. Por isso, a nossa orientação é migrar para o Simples Nacional Híbrido acompanhada de simulação tributária prévia e de revisão de preços, para que a empresa se programe com antecedência diante do impacto financeiro da decisão.",
  proximosPassos: "",
  pacote:
    "Simulações tributárias completas, comparando o Simples Nacional tradicional, o Simples Híbrido, o Lucro Presumido e o Lucro Real, com valores projetados de CBS e IBS mês a mês.\nEstudo de créditos por fornecedor e de débitos por cliente, com o efeito líquido no caixa.\nOrientação de precificação e de renegociação de contratos diante do novo sistema de créditos.\nAcompanhamento da opção ou do cancelamento no modelo híbrido, com todo o processo conduzido pela nossa equipe.",
  encerramento:
    "A reforma tributária não precisa ser um problema. Com a orientação certa, ela se torna uma oportunidade.",

};

export const estudoVazio: Estudo = {
  escritorio: "Nome do escritório contábil",
  cadastro: {
    razaoSocial: "",
    nomeFantasia: "",
    cnpj: "",
    abertura: "",
    endereco: "",
    situacao: "",
    naturezaJuridica: "",
    regimeAtual: "",
    capitalSocial: "",
  },
  cnaes: [],
  faturamento: zeros(),
  tributacoesNacionais: [],
  folha: zeros(),
  fornecedores: [],
  clientes: [],
  simulacoes: {
    simplesAtual: zeros(),
    simplesHibrido: zeros(),
    lucroPresumido: zeros(),
    lucroReal: zeros(),
  },
  observacoes: "",
  diagnostico: diagnosticoPadrao,
};

export const estudoExemplo: Estudo = {
  escritorio: "Escritório Contábil Exemplo LTDA",
  cadastro: {
    razaoSocial: "EMPRESA EXEMPLO LTDA",
    nomeFantasia: "Empresa Exemplo",
    cnpj: "00.000.000/0001-00",
    abertura: "01/01/2010",
    endereco: "Rua Exemplo, 100 — Centro — Cidade Exemplo/UF — 00000-000",
    situacao: "Ativa — Porte ME",
    naturezaJuridica: "206-2 — Sociedade Empresária Limitada",
    regimeAtual: "Simples Nacional",
    capitalSocial: "—",
  },
  cnaes: [
    {
      id: "c1",
      codigo: "0000-0/00",
      descricao: "Atividade principal de exemplo",
      compreende: "Descrição de exemplo do que a atividade compreende.",
      naoCompreende: "Descrição de exemplo do que a atividade não compreende.",
      anexo: "Anexo V — sujeito ao Fator R (exemplo)",
    },
  ],
  faturamento: [100000, 100000, 100000, 100000, 100000, 100000, 0, 0, 0, 0, 0, 0],
  tributacoesNacionais: [],
  folha: [30000, 30000, 30000, 30000, 30000, 30000, 0, 0, 0, 0, 0, 0],
  fornecedores: [
    { id: "f1", nome: "Fornecedor Exemplo A", cnpj: "00.000.000/0001-00", regime: "Normal", valor: 20000 },
    { id: "f2", nome: "Fornecedor Exemplo B", cnpj: "00.000.000/0002-00", regime: "Simples Nacional", valor: 8000 },
    { id: "f3", nome: "Fornecedor Exemplo C", cnpj: "00.000.000/0003-00", regime: "MEI", valor: 2000 },
  ],
  clientes: [
    { id: "cl1", nome: "Cliente Exemplo A", cnpj: "00.000.000/0001-00", regime: "Normal", valor: 300000 },
    { id: "cl2", nome: "Cliente Exemplo B", cnpj: "00.000.000/0002-00", regime: "Simples Nacional", valor: 200000 },
    { id: "cl3", nome: "Cliente Exemplo C", cnpj: "000.000.000-00", regime: "Outros (Pessoa Física)", valor: 100000 },
  ],
  simulacoes: {
    simplesAtual: [15000, 15000, 15000, 15000, 15000, 15000, 0, 0, 0, 0, 0, 0],
    simplesHibrido: [18000, 18000, 18000, 18000, 18000, 18000, 0, 0, 0, 0, 0, 0],
    lucroPresumido: [22000, 22000, 22000, 22000, 22000, 22000, 0, 0, 0, 0, 0, 0],
    lucroReal: [24000, 24000, 24000, 24000, 24000, 24000, 0, 0, 0, 0, 0, 0],
    tributos: {
      simplesAtual: [
        { nome: "IRPJ", valor: 8000 },
        { nome: "CSLL", valor: 7000 },
        { nome: "INSS/CPP", valor: 40000 },
        { nome: "ISS", valor: 20000 },
        { nome: "PIS/Pasep", valor: 5000 },
        { nome: "COFINS", valor: 10000 },
      ],
      simplesHibrido: [
        { nome: "IRPJ", valor: 8000 },
        { nome: "CSLL", valor: 7000 },
        { nome: "INSS/CPP", valor: 40000 },
        { nome: "ISS", valor: 20000 },
        { nome: "CBS", valor: 33000 },
      ],
      lucroPresumido: [
        { nome: "IRPJ", valor: 20000 },
        { nome: "CSLL", valor: 12000 },
        { nome: "INSS/CPP", valor: 47000 },
        { nome: "ISS", valor: 20000 },
        { nome: "CBS", valor: 33000 },
      ],
      lucroReal: [
        { nome: "IRPJ", valor: 26000 },
        { nome: "CSLL", valor: 14000 },
        { nome: "INSS/CPP", valor: 47000 },
        { nome: "ISS", valor: 20000 },
        { nome: "CBS", valor: 33000 },
      ],
    },
  },
  observacoes:
    "Dados fictícios de demonstração. Alíquotas de referência para 2027: IBS 18,70% e CBS 9,21%. Importe os relatórios do cliente para substituir este exemplo.",
  diagnostico: { ...diagnosticoPadrao, emitidoEm: "" },
};


export const brl = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

export const brlExato = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 2 });

export const pct = (v: number) =>
  `${(v * 100).toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`;

export const soma = (v: number[]) => v.reduce((a, b) => a + b, 0);

export type ResumoRegime = {
  regime: Regime;
  valor: number;
  participacao: number;
  geraCredito: boolean;
  ibs: number;
  cbs: number;
  ibsPotencial: number;
  cbsPotencial: number;
  quantidade: number;
};

export function agruparPorRegime(itens: Parceiro[]): {
  linhas: ResumoRegime[];
  total: number;
  totalIbs: number;
  totalCbs: number;
  totalIbsPotencial: number;
  totalCbsPotencial: number;
  totalSemCredito: number;
} {
  const total = itens.reduce((a, b) => a + b.valor, 0);
  const linhas: ResumoRegime[] = REGIMES.map((regime) => {
    const grupo = itens.filter((i) => i.regime === regime);
    const valor = grupo.reduce((a, b) => a + b.valor, 0);
    const geraCredito = REGIMES_COM_CREDITO.includes(regime);
    const ibsPotencial = grupo.reduce((a, b) => a + ibsDe(b), 0);
    const cbsPotencial = grupo.reduce((a, b) => a + cbsDe(b), 0);
    return {
      regime,
      valor,
      quantidade: grupo.length,
      participacao: total > 0 ? valor / total : 0,
      geraCredito,
      ibs: geraCredito ? ibsPotencial : 0,
      cbs: geraCredito ? cbsPotencial : 0,
      ibsPotencial,
      cbsPotencial,
    };
  }).filter((l) => l.quantidade > 0);

  return {
    linhas,
    total,
    totalIbs: linhas.reduce((a, b) => a + b.ibs, 0),
    totalCbs: linhas.reduce((a, b) => a + b.cbs, 0),
    totalIbsPotencial: linhas.reduce((a, b) => a + b.ibsPotencial, 0),
    totalCbsPotencial: linhas.reduce((a, b) => a + b.cbsPotencial, 0),
    totalSemCredito: linhas.filter((l) => !l.geraCredito).reduce((a, b) => a + b.valor, 0),
  };
}


export const CORES_REGIME: Record<Regime, string> = {
  Normal: "var(--color-ink)",
  "Lucro Real": "var(--color-ink)",
  "Lucro Presumido": "var(--color-brand)",
  "Simples Nacional": "var(--color-accent)",
  MEI: "var(--color-line)",
  "Outros (Pessoa Física)": "var(--color-mist)",
};

