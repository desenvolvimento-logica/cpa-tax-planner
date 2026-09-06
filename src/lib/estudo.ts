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

export type CenarioKey = "simplesAtual" | "simplesHibrido" | "lucroPresumido" | "lucroReal";

export type TributoLinha = { nome: string; valor: number };

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
  fornecedores: Parceiro[];
  clientes: Parceiro[];
  simulacoes: Simulacoes;
  observacoes: string;
  diagnostico: Diagnostico;
};

export const CENARIOS = [
  { key: "simplesAtual", label: "Simples Nacional — atual", fonte: "Detalhamento Simulação de Cálculo da Reforma Tributária · 2027" },
  { key: "simplesHibrido", label: "Simples Nacional — modelo híbrido", fonte: "Detalhamento Simulação de Cálculo da Reforma Tributária · 2027" },
  { key: "lucroPresumido", label: "Lucro Presumido", fonte: "Consulta Planejamento Tributário · 2027" },
  { key: "lucroReal", label: "Lucro Real", fonte: "Consulta Planejamento Tributário · 2027" },
] as const satisfies ReadonlyArray<{ key: keyof Simulacoes; label: string; fonte: string }>;

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
    "Você certamente já ouviu falar da Reforma Tributária — a maior mudança do sistema de impostos do Brasil nas últimas décadas. Ela substitui gradualmente os tributos atuais por dois novos, a CBS e o IBS, e muda a forma como as empresas se relacionam entre si na hora de comprar e vender.\n\nAqui na Lógica, nós não esperamos as mudanças chegarem: nos antecipamos a elas. Por isso, analisamos os dados fiscais da sua empresa e preparamos este diagnóstico exclusivo — um cuidado a mais com quem confia o seu negócio a nós, para que você tome decisões com tranquilidade e antes dos prazos apertarem.\n\nNas próximas páginas, você vai entender o que a reforma significa para o perfil da sua empresa, o que encontramos na análise e qual é a nossa orientação.",
  oQueMuda:
    "Com a CBS e o IBS, o Brasil passa a adotar um sistema de créditos amplo: cada empresa do chamado Regime Normal desconta, dos impostos que deve, o valor dos tributos pagos nas suas compras. Na prática, essas empresas passarão a dar preferência a fornecedores que conseguem transferir esse crédito integralmente.\n\nPara quem está no Simples Nacional, surge uma decisão estratégica: permanecer no formato tradicional (recolhimento único e simplificado, porém sem transferência integral de crédito) ou adotar o Simples Nacional Híbrido, em que a CBS e o IBS passam a ser apurados separadamente, permitindo repassar o crédito cheio aos clientes.\n\nNão existe resposta única: o melhor caminho depende de quem são os seus clientes e fornecedores — e foi exatamente isso que analisamos para você.",
  prazos:
    "A janela inicial para a opção pelo Simples Nacional Híbrido é setembro de 2026. O tempo para analisar, simular e decidir é limitado.\n\nCaso a empresa opte pela inclusão e precise reverter a decisão, o cancelamento nessa primeira fase poderá ser feito até novembro de 2026. Depois desse período, a permanência no regime poderá ser reavaliada trimestralmente.",
  orientacaoTitulo: "Nossa orientação: é aconselhável a mudança para o Simples Nacional Híbrido",
  orientacao:
    "A análise mostrou que a maior parte do faturamento da sua empresa vem de clientes do Regime Normal — empresas que, com a reforma, passarão a dar preferência a fornecedores capazes de transferir o crédito integral de CBS e IBS.\n\nDiante desse cenário, é aconselhável a mudança para o Simples Nacional Híbrido, acompanhada da simulação tributária prévia, para que a empresa se programe com antecedência diante do impacto financeiro da decisão.",
  proximosPassos:
    "Avaliar, com base neste diagnóstico, a importância dos clientes do Regime Normal para o seu faturamento e a necessidade de manter a competitividade junto a eles.\nConsiderar a Análise Tributária Completa, que inclui as simulações necessárias para a empresa se programar com o impacto financeiro da migração.\nLembrar dos prazos: setembro de 2026 para a inclusão no Simples Híbrido e novembro de 2026 para o cancelamento inicial — depois disso, a reavaliação passa a ser trimestral.",
  pacote:
    "Simulações tributárias completas, comparando o Simples Nacional tradicional, o Simples Híbrido, o Lucro Presumido e o Lucro Real, com valores projetados de CBS e IBS.\nOrientações personalizadas para cada decisão da empresa diante da reforma.\nAnálises detalhadas das informações fiscais — clientes, fornecedores e operações.\nInclusão ou cancelamento da empresa no modelo híbrido, com todo o processo conduzido pela nossa equipe.",
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
  escritorio: "Lógica Assessoria Contábil LTDA — EPP",
  cadastro: {
    razaoSocial: "JGWEBCOM SOLUCOES TECNOLOGICAS LTDA",
    nomeFantasia: "JGWEBCOM",
    cnpj: "11.791.968/0001-08",
    abertura: "25/03/2010",
    endereco:
      "Av. dos Trabalhadores, 116 — Sala 501 e 502, Edif. The Diploma Office — Vila Castelo Branco — Indaiatuba/SP — 13.338-050",
    situacao: "Ativa desde 25/03/2010 — Porte ME",
    naturezaJuridica: "206-2 — Sociedade Empresária Limitada",
    regimeAtual: "Simples Nacional",
    capitalSocial: "—",
  },
  cnaes: [
    {
      id: "c1",
      codigo: "7311-4/00",
      descricao: "Agências de publicidade (atividade principal)",
      compreende:
        "Criação e produção de campanhas de publicidade para qualquer finalidade, para veiculação em quaisquer veículos de comunicação; colocação, em nome de clientes, de material publicitário em jornais, revistas, rádio, televisão, internet e outros veículos; representação de veículos de comunicação para venda de tempo ou espaço publicitário; serviços de merchandising em rádio e televisão.",
      naoCompreende:
        "Operação de páginas de publicidade na internet (6319-4/00); agenciamento de espaços para publicidade, exceto em veículos de comunicação (7312-2/00); distribuição ou entrega de material publicitário (7319-0/02); promoção de vendas e publicidade no local da venda (7319-0/02); publicidade por mala direta, telefone ou visitas (7319-0/03); pesquisas de mercado e de opinião pública (7320-3/00).",
      anexo:
        "Anexo V (sujeito ao Fator R — passa ao Anexo III quando o Fator R for igual ou superior a 28%) — art. 18, § 5º-I, X e § 5º-J da LC 123/2006",
    },
    {
      id: "c2",
      codigo: "6201-5/01",
      descricao: "Desenvolvimento de programas de computador sob encomenda",
      compreende:
        "Desenvolvimento de sistemas conforme a necessidade do cliente (definição de módulos, especificações funcionais internas, relatórios e testes de desempenho); programação com uso de ferramentas e linguagens de programação; fornecimento de documentação dos programas desenvolvidos sob encomenda; desenvolvimento de projetos e modelagem de banco de dados sob encomenda.",
      naoCompreende:
        "Desenho de páginas para a internet — web design (6201-5/02); desenvolvimento e licenciamento de programas customizáveis (6202-3/00); desenvolvimento e licenciamento de programas não customizáveis (6203-1/00); customização de programas de computador (6204-0/00).",
      anexo:
        "Anexo III (sujeito ao Fator R — passa ao Anexo V quando o Fator R for inferior a 28%) — art. 18, § 5º-D, IV e § 5º-M, II da LC 123/2006",
    },
    {
      id: "c3",
      codigo: "6209-1/00",
      descricao: "Suporte técnico, manutenção e outros serviços em tecnologia da informação",
      compreende:
        "Assessoramento ao usuário na utilização de sistemas, remotamente ou nas instalações do cliente (help-desk); solução de problemas de navegabilidade e utilização de websites; recuperação de panes informáticas; instalação de equipamentos de informática e de programas; manutenção em tecnologia da informação, com modificações no sistema para atender alterações técnicas, aprimorar recursos e corrigir falhas.",
      naoCompreende:
        "Assessoria em informática associada à venda de computadores e periféricos (47.51-2 e 46.51-6); desenvolvimento de programas sob encomenda (6201-5/00); customização de programas (6204-0/00); reparação e manutenção de computadores e periféricos (9511-8/00).",
      anexo:
        "Anexo III para instalação de computadores e periféricos (art. 18, § 5º-F); Anexo V sujeito ao Fator R para suporte técnico e manutenção em TI (art. 18, § 5º-I, XII e § 5º-J), passando ao Anexo III com Fator R ≥ 28%",
    },
  ],
  // Faturamento declarado de 01/01/2026 a 31/07/2026 — total R$ 1.358.994,30
  faturamento: [217281.3, 187029.3, 170205.5, 191820.8, 188320.8, 198975.5, 205361.1, 0, 0, 0, 0, 0],
  fornecedores: [
    { id: "f22", nome: "PLUXEE BENEFICIOS BRASIL S.A", cnpj: "69.034.668/0001-56", regime: "Normal", valor: 14.0 },
    { id: "f32", nome: "VHSYS SISTEMA DE GESTAO S.A.", cnpj: "12.702.717/0001-64", regime: "Normal", valor: 3698.02 },
    { id: "f57", nome: "UNIMED CAMPINAS COOPERATIVA DE TRABALHO MEDICO", cnpj: "46.124.624/0001-11", regime: "Normal", valor: 8035.08 },
    { id: "f188", nome: "UNIMED CAMPINAS COOPERATIVA DE TRABALHO MEDICO", cnpj: "46.124.624/0001-11", regime: "Normal", valor: 53176.71 },
    { id: "f189", nome: "AMAZON AWS SERVICOS BRASIL LTDA", cnpj: "23.412.247/0001-10", regime: "Normal", valor: 4996.63 },
    { id: "f190", nome: "GOOGLE CLOUD BRASIL COMPUTACAO E SERVICOS DE DADOS LTDA.", cnpj: "25.012.398/0001-07", regime: "Normal", valor: 5586.0 },
    { id: "f191", nome: "CLICKSIGN GESTAO DE DOCUMENTOS S/A", cnpj: "12.499.520/0001-70", regime: "Normal", valor: 354.0 },
    { id: "f192", nome: "PAGAR.ME INSTITUICAO DE PAGAMENTO S.A", cnpj: "18.727.053/0001-74", regime: "Normal", valor: 5.04 },
    { id: "f193", nome: "PLUXEE BENEFICIOS BRASIL S.A", cnpj: "69.034.668/0001-56", regime: "Normal", valor: 40404.0 },
    { id: "f198", nome: "SANARE - SERVICOS DE SAUDE LTDA", cnpj: "05.653.550/0001-23", regime: "Normal", valor: 8115.6 },
    { id: "f200", nome: "SMSMARKET SOLUCOES INTELIGENTES LTDA", cnpj: "14.948.864/0001-44", regime: "Normal", valor: 1470.0 },
    { id: "f201", nome: "MLABS SOFTWARE S.A.", cnpj: "23.465.964/0001-00", regime: "Normal", valor: 1798.8 },
    { id: "f204", nome: "IMUNOVACIN VACINAS LTDA.", cnpj: "24.433.654/0001-77", regime: "Normal", valor: 2200.0 },
    { id: "f206", nome: "INNOVATION COMERCIO DE BRINDES", cnpj: "10.635.104/0001-26", regime: "Normal", valor: 532.0 },
    { id: "f207", nome: "AUTO POSTO TRE FRATELLI LTDA", cnpj: "17.404.571/0001-94", regime: "Normal", valor: 2114.34 },
    { id: "f208", nome: "SSR COMERCIO E SERVICOS LTDA", cnpj: "00.906.766/0002-10", regime: "Normal", valor: 349.2 },
    { id: "f100", nome: "ANA CAROLINA MARQUES BULL DA SILVA (ME)", cnpj: "38.402.762/0001-97", regime: "Simples Nacional", valor: 1955.0 },
    { id: "f196", nome: "PRISCILA RODRIGUES DE MENESES (ME)", cnpj: "33.302.739/0001-07", regime: "Simples Nacional", valor: 1450.0 },
    { id: "f197", nome: "CLEBER ALVES DA SILVA (ME)", cnpj: "20.356.748/0001-39", regime: "Simples Nacional", valor: 145.0 },
    { id: "f202", nome: "LHF CONFECCOES LTDA - ME", cnpj: "10.746.458/0001-48", regime: "Simples Nacional", valor: 1300.0 },
    { id: "f203", nome: "SP INTELIGENCIA DIGITAL LTDA (ME)", cnpj: "19.652.495/0001-61", regime: "Simples Nacional", valor: 144.27 },
    { id: "f205", nome: "RPZ AR CONDICIONADO LTDA (ME)", cnpj: "41.246.494/0001-76", regime: "Simples Nacional", valor: 850.0 },
    { id: "f98", nome: "JUSCO COMERCIO DE MATERIAIS E PRODUTOS DE LIMPEZA LTDA (EPP)", cnpj: "00.023.815/0001-96", regime: "Simples Nacional", valor: 1277.5 },
    { id: "f199", nome: "JC DIAS FILMES (EPP)", cnpj: "19.812.710/0001-44", regime: "Simples Nacional", valor: 22950.0 },
  ],
  clientes: [
    { id: "cl11", nome: "PARQUE ECOLOGICO EDUCACAO LTDA", cnpj: "11.102.213/0001-40", regime: "Normal", valor: 64925.7 },
    { id: "cl15", nome: "SANEX SOLUCOES EIRELI", cnpj: "05.350.401/0001-95", regime: "Normal", valor: 4749.0 },
    { id: "cl19", nome: "SYMCO MEDICINA S/S LTDA", cnpj: "04.143.627/0001-52", regime: "Normal", valor: 5580.0 },
    { id: "cl158", nome: "FACULDADE UNITA LTDA", cnpj: "04.187.523/0001-40", regime: "Normal", valor: 46240.0 },
    { id: "cl159", nome: "ASSOCIACAO EDUCACIONAL LUMEN", cnpj: "14.100.215/0001-99", regime: "Normal", valor: 18760.0 },
    { id: "cl260", nome: "MARGOSSIAN SEMENTES LTDA", cnpj: "02.729.532/0001-90", regime: "Normal", valor: 405.0 },
    { id: "cl286", nome: "HILAQUI PRODUCOES E EVENTOS LTDA ME", cnpj: "08.756.668/0001-75", regime: "Normal", valor: 3510.0 },
    { id: "cl433", nome: "CIENCIAS E LETRAS ENSINO LTDA", cnpj: "71.481.584/0001-02", regime: "Normal", valor: 19764.0 },
    { id: "cl10007", nome: "CONGESA ENGENHARIA E CONSTRUCOES LTDA", cnpj: "96.161.237/0001-23", regime: "Normal", valor: 17148.9 },
    { id: "cl10009", nome: "INOVA CONSULTORIA DE GESTAO E INOVACAO", cnpj: "22.110.885/0001-14", regime: "Normal", valor: 21400.0 },
    { id: "cl10858", nome: "COLEGIO MORUMBI LTDA", cnpj: "05.482.594/0002-19", regime: "Normal", valor: 35560.0 },
    { id: "cl10964", nome: "DE CRIANCA PARA CRIANCA COMERCIO DE MATERIAIS", cnpj: "28.201.868/0001-79", regime: "Normal", valor: 25837.0 },
    { id: "cl11017", nome: "ESCOLA NOVA LOURENCO CASTANHO LTDA", cnpj: "62.623.335/0001-13", regime: "Normal", valor: 31726.5 },
    { id: "cl11282", nome: "SISTEMA EDUCACIONAL BARAO LTDA", cnpj: "50.360.502/0001-00", regime: "Normal", valor: 15430.0 },
    { id: "cl11425", nome: "CA INDAIATUBA 3 EMPREENDIMENTOS E PARTICIPACOES", cnpj: "10.464.114/0001-46", regime: "Normal", valor: 79400.0 },
    { id: "cl11454", nome: "PARQUE ECOLOGICO EDUCACAO LTDA (filial)", cnpj: "11.102.213/0002-21", regime: "Normal", valor: 16730.7 },
    { id: "cl11549", nome: "AA3 EMPREENDIMENTOS IMOBILIARIOS SPE LTDA", cnpj: "27.562.805/0001-85", regime: "Normal", valor: 2192.7 },
    { id: "cl11568", nome: "SISTEMA EDUCACIONAL OSASCO LTDA", cnpj: "53.410.981/0001-01", regime: "Normal", valor: 10780.0 },
    { id: "cl11777", nome: "SANTO ANTONIO 1 EMPREENDIMENTOS IMOBILIARIOS SPE", cnpj: "43.662.871/0001-83", regime: "Normal", valor: 15348.9 },
    { id: "cl11815", nome: "JARDIM PLANALTO INCORPORACOES IMOBILIARIAS SPE LTDA", cnpj: "41.505.187/0001-62", regime: "Normal", valor: 29400.0 },
    { id: "cl11820", nome: "FAHL SPE INDAIATUBA - LOTEAMENTO E INCORPORACAO", cnpj: "34.079.427/0001-49", regime: "Normal", valor: 88200.0 },
    { id: "cl11920", nome: "SANTO ANTONIO 2 EMPREENDIMENTOS IMOBILIARIOS SPE", cnpj: "43.771.848/0001-27", regime: "Normal", valor: 15348.9 },
    { id: "cl11978", nome: "24 DE MAIO EMPREENDIMENTO IMOBILIARIO SPE LTDA", cnpj: "51.685.586/0001-06", regime: "Normal", valor: 104538.0 },
    { id: "cl12015", nome: "PARK MERAKI 10 EMPREENDIMENTOS E PARTICIPACOES", cnpj: "48.834.043/0001-07", regime: "Normal", valor: 2520.0 },
    { id: "cl12320", nome: "TERRANOBILLIS EMPREENDIMENTOS IMOBILIARIOS", cnpj: "14.307.802/0001-53", regime: "Normal", valor: 72800.0 },
    { id: "cl12359", nome: "ROED PARTICIPACOES E NEGOCIOS IMOBILIARIOS LTDA", cnpj: "55.020.725/0001-33", regime: "Normal", valor: 54585.0 },
    { id: "cl12366", nome: "INDAIATUBA 1 EMPREENDIMENTO IMOBILIARIO SPE LTDA", cnpj: "54.443.323/0001-89", regime: "Normal", valor: 67200.0 },
    { id: "cl12394", nome: "RESIDENCIAL TERRAS DE SAO BENTO EMPREENDIMENTOS", cnpj: "54.706.926/0001-26", regime: "Normal", valor: 55720.0 },
    { id: "cl12399", nome: "GPCI E PECFLOR EMPREENDIMENTO IMOBILIARIO SPE", cnpj: "50.725.789/0001-16", regime: "Normal", valor: 67200.0 },
    { id: "cl12439", nome: "AA7 EMPREENDIMENTOS IMOBILIARIOS SPE LTDA", cnpj: "52.818.417/0001-60", regime: "Normal", valor: 15532.7 },
    { id: "cl12473", nome: "PARQUE VILLE DE PROVENCE EMPREENDIMENTO IMOBILIARIO", cnpj: "40.147.152/0001-36", regime: "Normal", valor: 106230.0 },
    { id: "cl12485", nome: "TREVISO PAULINIA EMPREENDIMENTOS IMOBILIARIOS SPE", cnpj: "59.411.707/0001-33", regime: "Normal", valor: 14190.0 },
    { id: "cl12486", nome: "SALTO RESERVA TOSCANA EMPREENDIMENTOS IMOBILIARIOS", cnpj: "31.383.618/0001-01", regime: "Normal", valor: 17200.0 },
    { id: "cl12525", nome: "LINA RESIDENCE EMPREENDIMENTOS IMOBILIARIOS SPE", cnpj: "56.984.210/0001-16", regime: "Normal", valor: 84000.0 },
    { id: "cl12545", nome: "PINHEIROS 1 EMPREENDIMENTOS IMOBILIARIOS SPE LTDA", cnpj: "50.161.190/0001-05", regime: "Normal", valor: 14322.2 },
    { id: "cl12588", nome: "INSTITUTO EDUCACIONAL DE AMERICANA LTDA", cnpj: "11.181.562/0001-03", regime: "Normal", valor: 11573.3 },
    { id: "cl12589", nome: "ANA MARIA VASTELLA VEGRO GIACOMIN", cnpj: "329.693.238-00", regime: "Normal", valor: 0 },
    { id: "cl12590", nome: "CA QUINTA DA PRIMAVERA I EMPREENDIMENTOS IMOBILIARIOS", cnpj: "45.261.131/0001-60", regime: "Normal", valor: 29060.0 },
    { id: "cl12591", nome: "LOFTS - PLANEJAMENTO E INCORPORACAO LTDA.", cnpj: "04.312.599/0001-50", regime: "Normal", valor: 30000.0 },
    { id: "cl374", nome: "ASSOCIACAO DE ENSINO DE BOITUVA S/S LTDA (ME)", cnpj: "71.562.045/0001-06", regime: "Simples Nacional", valor: 5833.1 },
    { id: "cl11147", nome: "A CARVALHO SERVICOS DE APOIO ADMINISTRATIVO LTDA (ME)", cnpj: "29.988.333/0001-52", regime: "Simples Nacional", valor: 380.0 },
    { id: "cl11519", nome: "FABIO GOMES DE AVILA (ME)", cnpj: "05.315.131/0001-81", regime: "Simples Nacional", valor: 510.0 },
    { id: "cl59", nome: "SOLARYS ENGENHARIA E INSTALACOES LTDA (EPP)", cnpj: "07.568.295/0001-46", regime: "Simples Nacional", valor: 500.0 },
    { id: "cl278", nome: "UNITA EDUCACIONAL LTDA (EPP)", cnpj: "09.441.008/0001-68", regime: "Simples Nacional", valor: 3187.7 },
    { id: "cl282", nome: "YPUA SANEAMENTO AMBIENTAL EIRELI (EPP)", cnpj: "21.429.112/0001-32", regime: "Simples Nacional", valor: 290.0 },
    { id: "cl10346", nome: "WINES4U COMERCIO, IMPORTACAO E EXPORTACAO (EPP)", cnpj: "25.036.026/0001-10", regime: "Simples Nacional", valor: 28045.0 },
    { id: "cl10705", nome: "GAIVOTA NATACAO LTDA (EPP)", cnpj: "00.744.402/0001-09", regime: "Simples Nacional", valor: 630.0 },
    { id: "cl12423", nome: "R. PARK ESTACIONAMENTO DE VEICULOS LTDA (EPP)", cnpj: "10.893.982/0002-22", regime: "Simples Nacional", valor: 3780.0 },
    { id: "cl10121", nome: "FAUSTO FERREIRA DA SILVA", cnpj: "584.460.528-49", regime: "Outros (Pessoa Física)", valor: 450.0 },
    { id: "cl10782", nome: "MARIANA DE CASSIA GOMES", cnpj: "317.023.148-04", regime: "Outros (Pessoa Física)", valor: 280.0 },
    { id: "cl11478", nome: "JOAO GABRIEL GIACOMIN", cnpj: "326.677.948-77", regime: "Outros (Pessoa Física)", valor: 0 },
  ],
  simulacoes: {
    simplesAtual: [35406.2, 30596.58, 27734.15, 31188.74, 30416.7, 31739.41, 32642.45, 0, 0, 0, 0, 0],
    simplesHibrido: [66637.57, 58408.68, 50496.9, 57864.91, 56118.55, 58693.12, 65584.67, 0, 0, 0, 0, 0],
    lucroPresumido: [45953.84, 41271.3, 95624.05, 41631.73, 40559.53, 101073.15, 47253.97, 0, 16343.29, 0, 0, 0],
    lucroReal: [45953.84, 41271.3, 111664.74, 41631.73, 40559.53, 115985.85, 47253.97, 0, 21436.29, 0, 0, 0],
  },
  observacoes:
    "Dados cadastrais conforme Comprovante de Inscrição CNPJ emitido em 06/09/2026. Faturamento e perfil tributário de clientes e fornecedores referentes ao período de 01/01/2026 a 31/07/2026. Alíquotas de referência para 2027: IBS 18,70% e CBS 9,21%. Simples Nacional atual e modelo híbrido extraídos do Detalhamento Simulação de Cálculo da Reforma Tributária (1ª Fase 2027); Lucro Presumido e Lucro Real extraídos da Consulta Planejamento Tributário (ano 2027). Meses sem movimento permanecem zerados por ausência de dados no período.",
  diagnostico: { ...diagnosticoPadrao, emitidoEm: "06 de setembro de 2026" },
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
  Normal: "var(--color-ink)",
  "Lucro Real": "var(--color-ink)",
  "Lucro Presumido": "var(--color-brand)",
  "Simples Nacional": "var(--color-accent)",
  MEI: "var(--color-line)",
  "Outros (Pessoa Física)": "var(--color-mist)",
};

