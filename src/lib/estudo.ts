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

export type Parceiro = {
  id: string;
  nome: string;
  cnpj: string;
  regime: Regime;
  valor: number;
};

export type Simulacoes = {
  simplesAtual: number[];
  simplesHibrido: number[];
  lucroPresumido: number[];
  lucroReal: number[];
};

export type Estudo = {
  escritorio: string;
  cadastro: Cadastro;
  cnaes: CnaeItem[];
  faturamento: number[];
  fornecedores: Parceiro[];
  clientes: Parceiro[];
  simulacoes: Simulacoes;
  observacoes: string;
};

export const CENARIOS = [
  { key: "simplesAtual", label: "Simples Nacional — atual", fonte: "Detalhamento Simulação de Cálculo da Reforma Tributária · 2027" },
  { key: "simplesHibrido", label: "Simples Nacional — modelo híbrido", fonte: "Detalhamento Simulação de Cálculo da Reforma Tributária · 2027" },
  { key: "lucroPresumido", label: "Lucro Presumido", fonte: "Consulta Planejamento Tributário · 2027" },
  { key: "lucroReal", label: "Lucro Real", fonte: "Consulta Planejamento Tributário · 2027" },
] as const satisfies ReadonlyArray<{ key: keyof Simulacoes; label: string; fonte: string }>;

const zeros = () => Array.from({ length: 12 }, () => 0);

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
  fornecedores: [],
  clientes: [],
  simulacoes: {
    simplesAtual: zeros(),
    simplesHibrido: zeros(),
    lucroPresumido: zeros(),
    lucroReal: zeros(),
  },
  observacoes: "",
};

export const estudoExemplo: Estudo = {
  escritorio: "Contmais Assessoria Contábil",
  cadastro: {
    razaoSocial: "Vetor Logística e Comércio LTDA",
    nomeFantasia: "Vetor Log",
    cnpj: "12.345.678/0001-90",
    abertura: "14/03/2013",
    endereco: "Av. das Nações, 1200 — Sala 8 — São Paulo/SP — 04578-000",
    situacao: "Ativa",
    naturezaJuridica: "206-2 — Sociedade Empresária Limitada",
    regimeAtual: "Simples Nacional",
    capitalSocial: "R$ 250.000,00",
  },
  cnaes: [
    {
      id: "c1",
      codigo: "4930-2/02",
      descricao: "Transporte rodoviário de carga, exceto produtos perigosos e mudanças, intermunicipal, interestadual e internacional",
      compreende: "Transporte de cargas em geral por rodovia entre municípios e estados; coleta e entrega vinculadas ao frete contratado.",
      naoCompreende: "Transporte de produtos perigosos (4930-2/03); serviços de mudança (4930-2/04); armazenagem isolada.",
      anexo: "Anexo III",
    },
    {
      id: "c2",
      codigo: "5211-7/99",
      descricao: "Depósitos de mercadorias para terceiros, exceto armazéns gerais e guarda-móveis",
      compreende: "Guarda e conservação de mercadorias de terceiros, controle de estoque e movimentação interna.",
      naoCompreende: "Armazéns gerais com emissão de warrant (5211-7/01); guarda-móveis (5211-7/02).",
      anexo: "Anexo III",
    },
    {
      id: "c3",
      codigo: "4649-4/99",
      descricao: "Comércio atacadista de outros equipamentos e artigos de uso pessoal e doméstico não especificados anteriormente",
      compreende: "Revenda por atacado de mercadorias adquiridas de terceiros para lojistas e empresas.",
      naoCompreende: "Comércio varejista ao consumidor final; representação comercial por conta de terceiros.",
      anexo: "Anexo I",
    },
  ],
  faturamento: [382000, 341000, 435000, 418000, 456000, 490000, 402000, 388000, 421000, 447000, 463000, 377000],
  fornecedores: [
    { id: "f1", nome: "Pneus Brasil Distribuidora S.A.", cnpj: "01.234.567/0001-11", regime: "Lucro Real", valor: 620000 },
    { id: "f2", nome: "Auto Peças Central LTDA", cnpj: "02.345.678/0001-22", regime: "Lucro Presumido", valor: 410000 },
    { id: "f3", nome: "Combustíveis Rota Sul LTDA", cnpj: "03.456.789/0001-33", regime: "Lucro Real", valor: 1000000 },
    { id: "f4", nome: "Manutenção Diesel ME", cnpj: "04.567.890/0001-44", regime: "Simples Nacional", valor: 280000 },
    { id: "f5", nome: "Embalagens Vale LTDA ME", cnpj: "05.678.901/0001-55", regime: "Simples Nacional", valor: 150000 },
    { id: "f6", nome: "Transportador Autônomo — José R.", cnpj: "123.456.789-00", regime: "Outros (Pessoa Física)", valor: 300000 },
    { id: "f7", nome: "Serviços de TI Nuvem MEI", cnpj: "06.789.012/0001-66", regime: "MEI", valor: 60000 },
  ],
  clientes: [
    { id: "cl1", nome: "Indústria Metalgraf S.A.", cnpj: "10.111.222/0001-01", regime: "Lucro Real", valor: 1850000 },
    { id: "cl2", nome: "Distribuidora Norte LTDA", cnpj: "11.222.333/0001-02", regime: "Lucro Presumido", valor: 1230000 },
    { id: "cl3", nome: "Comércio Estrela ME", cnpj: "12.333.444/0001-03", regime: "Simples Nacional", valor: 890000 },
    { id: "cl4", nome: "Mercado Bom Preço EIRELI", cnpj: "13.444.555/0001-04", regime: "Simples Nacional", valor: 520000 },
    { id: "cl5", nome: "Clientes Pessoa Física (consolidado)", cnpj: "—", regime: "Outros (Pessoa Física)", valor: 330000 },
  ],
  simulacoes: {
    simplesAtual: [42800, 38200, 48700, 46800, 51100, 54900, 45000, 43400, 47100, 50100, 51900, 42200],
    simplesHibrido: [38900, 34800, 44300, 42600, 46500, 49900, 40900, 39500, 42800, 45500, 47200, 38400],
    lucroPresumido: [46100, 41200, 52500, 50500, 55100, 59200, 48500, 46800, 50800, 54000, 56000, 45500],
    lucroReal: [40200, 35900, 45800, 44000, 48000, 51600, 42300, 40800, 44300, 47100, 48800, 39700],
  },
  observacoes:
    "Estudo elaborado com base nos relatórios Detalhamento Simulação de Cálculo da Reforma Tributária e Consulta Planejamento Tributário, cenário 2027. Alíquotas de referência: IBS 18,70% e CBS 9,21%.",
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
  quantidade: number;
};

export function agruparPorRegime(itens: Parceiro[]): {
  linhas: ResumoRegime[];
  total: number;
  totalIbs: number;
  totalCbs: number;
  totalSemCredito: number;
} {
  const total = itens.reduce((a, b) => a + b.valor, 0);
  const linhas: ResumoRegime[] = REGIMES.map((regime) => {
    const grupo = itens.filter((i) => i.regime === regime);
    const valor = grupo.reduce((a, b) => a + b.valor, 0);
    const geraCredito = REGIMES_COM_CREDITO.includes(regime);
    return {
      regime,
      valor,
      quantidade: grupo.length,
      participacao: total > 0 ? valor / total : 0,
      geraCredito,
      ibs: geraCredito ? valor * ALIQUOTA_IBS : 0,
      cbs: geraCredito ? valor * ALIQUOTA_CBS : 0,
    };
  }).filter((l) => l.quantidade > 0);

  return {
    linhas,
    total,
    totalIbs: linhas.reduce((a, b) => a + b.ibs, 0),
    totalCbs: linhas.reduce((a, b) => a + b.cbs, 0),
    totalSemCredito: linhas.filter((l) => !l.geraCredito).reduce((a, b) => a + b.valor, 0),
  };
}

export const CORES_REGIME: Record<Regime, string> = {
  "Lucro Real": "var(--color-ink)",
  "Lucro Presumido": "var(--color-brand)",
  "Simples Nacional": "var(--color-accent)",
  MEI: "var(--color-line)",
  "Outros (Pessoa Física)": "var(--color-mist)",
};
