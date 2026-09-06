import capa from "@/assets/capa-diagnostico.jpg";
import logoLogica from "@/assets/logica-na-reforma.jpg.asset.json";
import {
  ALIQUOTA_CBS,
  ALIQUOTA_IBS,
  CENARIOS,
  agruparPorRegime,
  brlExato,
  pct,
  soma,
  type Estudo,
} from "@/lib/estudo";

function Paragrafos({ texto, className }: { texto: string; className?: string }) {
  return (
    <>
      {texto
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean)
        .map((linha, i) => (
          <p key={i} className={className ?? "mt-3 text-[10.5pt] leading-relaxed text-ink/85"}>
            {linha}
          </p>
        ))}
    </>
  );
}

function Lista({ texto }: { texto: string }) {
  const itens = texto
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  return (
    <ul className="mt-3 space-y-2">
      {itens.map((item, i) => (
        <li key={i} className="flex gap-3 text-[10.5pt] leading-relaxed text-ink/85">
          <span className="mt-[7px] inline-block size-1.5 shrink-0 bg-accent-warm" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function Pagina({
  children,
  rodape,
  numero,
  total,
  semPadding,
}: {
  children: React.ReactNode;
  rodape?: string;
  numero?: number;
  total?: number;
  semPadding?: boolean;
}) {
  return (
    <div className="pagina-doc relative mx-auto mb-6 flex w-[210mm] min-h-[297mm] flex-col bg-white shadow-[0_18px_50px_-25px_rgba(0,0,0,0.4)] print:mb-0">
      <div className={semPadding ? "flex flex-1 flex-col" : "flex flex-1 flex-col px-[18mm] pt-[16mm] pb-[20mm]"}>
        {children}
      </div>
      {rodape ? (
        <div className="absolute inset-x-[18mm] bottom-[10mm] border-t border-line pt-2 text-center text-[7.5pt] leading-snug text-ink/55">
          {rodape}
          {numero ? (
            <span className="ml-2">
              · Página {numero} de {total}
            </span>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function Cabecalho() {
  return (
    <div className="mb-6 flex items-center justify-between border-b border-line pb-4">
      <img src={logoLogica.url} alt="Lógica na Reforma" className="h-9 w-auto mix-blend-multiply" />
      <span className="text-[7.5pt] uppercase tracking-[0.25em] text-brand">Diagnóstico · Reforma Tributária</span>
    </div>
  );
}

function TabelaPerfil({
  titulo,
  linhas,
  colunaValor,
}: {
  titulo: string;
  colunaValor: string;
  linhas: { perfil: string; participacao: number; valor: number; efeito: string }[];
}) {
  return (
    <table className="mt-4 w-full border-collapse text-[9.5pt]">
      <thead>
        <tr className="bg-frost text-left">
          <th className="border border-line px-2 py-1.5 font-display font-semibold">{titulo}</th>
          <th className="border border-line px-2 py-1.5 font-display font-semibold">{colunaValor}</th>
          <th className="border border-line px-2 py-1.5 font-display font-semibold">Valor</th>
          <th className="border border-line px-2 py-1.5 font-display font-semibold">O que muda com a reforma</th>
        </tr>
      </thead>
      <tbody>
        {linhas.map((l) => (
          <tr key={l.perfil}>
            <td className="border border-line px-2 py-1.5">{l.perfil}</td>
            <td className="border border-line px-2 py-1.5">{pct(l.participacao)}</td>
            <td className="border border-line px-2 py-1.5">{brlExato(l.valor)}</td>
            <td className="border border-line px-2 py-1.5 text-ink/75">{l.efeito}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function DocumentoDiagnostico({ estudo }: { estudo: Estudo }) {
  const d = estudo.diagnostico;
  const rodape = `${d.endereco} · ${d.telefone} · ${d.site} · ${d.email}`;

  const clientes = agruparPorRegime(estudo.clientes);
  const fornecedores = agruparPorRegime(estudo.fornecedores);
  const faturamento = soma(estudo.faturamento);
  const participacaoNormal = clientes.linhas
    .filter((l) => l.geraCredito)
    .reduce((a, b) => a + b.participacao, 0);

  const totaisCenarios = CENARIOS.map((c) => ({
    label: c.label,
    total: soma(estudo.simulacoes[c.key]),
  })).filter((c) => c.total > 0);

  return (
    <div className="font-body text-ink">
      {/* Capa */}
      <Pagina semPadding>
        <div className="flex flex-1 flex-col border-[3px] border-accent-warm/70">
          <div className="relative flex-1">
            <img src={capa} alt="" width={1280} height={860} className="absolute inset-0 size-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-b from-white/95 via-white/70 to-white/10" />
            <div className="relative flex h-full flex-col px-[16mm] pt-[14mm]">
              <p className="text-center text-[9pt] uppercase tracking-[0.4em] text-accent-warm">{d.tituloCapa}</p>
              <span className="mx-auto mt-2 block h-[2px] w-14 bg-accent-warm" />
              <img
                src={logoLogica.url}
                alt="Lógica na Reforma — da contabilidade à estratégia"
                className="mx-auto mt-10 h-40 w-auto mix-blend-multiply"
              />
            </div>
          </div>
          <div className="bg-accent-warm px-[16mm] py-3">
            <p className="text-center font-display text-[13pt] font-semibold text-white">{d.chamadaCapa}</p>
          </div>
          <div className="bg-frost px-[16mm] py-6 text-center">
            <p className="text-[8pt] uppercase tracking-[0.35em] text-accent-warm">{d.subtituloCapa}</p>
            <h1 className="mt-2 font-display text-[15pt] font-semibold uppercase leading-tight">
              {estudo.cadastro.razaoSocial}
            </h1>
            <p className="mt-2 text-[9pt] text-ink/70">
              Ano-base {d.anoBase}
              {d.emitidoEm ? ` · Emitido em ${d.emitidoEm}` : ""}
            </p>
            <p className="mt-1 text-[8pt] italic text-ink/50">{d.confidencial}</p>
            <p className="mt-1 text-[8pt] text-ink/60">CNPJ {estudo.cadastro.cnpj}</p>
          </div>
          <div className="border-t border-line bg-white px-[16mm] py-4 text-center text-[8.5pt] text-ink/70">
            {d.telefone} &nbsp;|&nbsp; {d.email} &nbsp;|&nbsp; {d.site}
          </div>
        </div>
      </Pagina>


      {/* Introdução */}
      <Pagina rodape={rodape} numero={2} total={5}>
        <Cabecalho />
        <h2 className="font-display text-[14pt] font-semibold">{d.saudacao}</h2>
        <Paragrafos texto={d.introducao} />
        <h3 className="mt-8 font-display text-[12pt] font-semibold text-brand">O que muda com a Reforma Tributária</h3>
        <Paragrafos texto={d.oQueMuda} />

        <h3 className="mt-8 font-display text-[12pt] font-semibold text-brand">
          Simples tradicional e Simples Híbrido lado a lado
        </h3>
        <table className="mt-3 w-full border-collapse text-[9pt]">
          <thead>
            <tr className="bg-frost text-left">
              <th className="border border-line px-2 py-1.5 font-display font-semibold">Como fica</th>
              <th className="border border-line px-2 py-1.5 font-display font-semibold">Simples tradicional</th>
              <th className="border border-line px-2 py-1.5 font-display font-semibold">Simples Híbrido</th>
            </tr>
          </thead>
          <tbody>
            {[
              [
                "CBS e IBS",
                "Dentro da guia única do Simples, sem apuração separada",
                "Apurados e recolhidos à parte, pelo regime regular",
              ],
              [
                "Crédito repassado ao cliente",
                "Limitado ao valor contido na guia do Simples",
                "Crédito integral de CBS e IBS na nota",
              ],
              [
                "Crédito sobre as compras",
                "Não aproveita crédito das compras",
                "Aproveita o crédito de fornecedores do regime regular",
              ],
              [
                "Demais tributos (IRPJ, CSLL, CPP)",
                "Permanecem no Simples",
                "Permanecem no Simples",
              ],
              [
                "Obrigações e controles",
                "Mais simples, guia única",
                "Exige controle de créditos e documentação fiscal das compras",
              ],
            ].map(([a, b, c]) => (
              <tr key={a}>
                <td className="border border-line px-2 py-1.5 font-medium">{a}</td>
                <td className="border border-line px-2 py-1.5 text-ink/75">{b}</td>
                <td className="border border-line px-2 py-1.5 text-ink/75">{c}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-8 border-l-4 border-accent-warm bg-frost px-4 py-3">
          <p className="font-display text-[10.5pt] font-semibold">Ponto de atenção: abrangência da análise</p>
          <p className="mt-2 text-[9.5pt] leading-relaxed text-ink/75">
            Esta análise foi elaborada com base nas informações e nos documentos fiscais regularmente registrados pela
            empresa. Operações não acobertadas por documentos fiscais idôneos não integram esta avaliação e poderão
            impactar as conclusões apresentadas.
          </p>
        </div>
      </Pagina>

      {/* Prazos + análise */}
      <Pagina rodape={rodape} numero={3} total={5}>
        <Cabecalho />
        <h3 className="font-display text-[12pt] font-semibold text-brand">Atenção ao prazo</h3>
        <Paragrafos texto={d.prazos} />

        <h3 className="mt-8 font-display text-[12pt] font-semibold text-brand">A análise que fizemos para você</h3>
        <p className="mt-3 text-[10.5pt] leading-relaxed text-ink/85">
          Analisamos as vendas da sua empresa no ano-base de {d.anoBase}, somando {brlExato(faturamento)}. Veja como o
          seu faturamento se distribui entre os perfis de cliente:
        </p>
        <TabelaPerfil
          titulo="Perfil do cliente"
          colunaValor="% do faturamento"
          linhas={clientes.linhas.map((l) => ({
            perfil: l.regime,
            participacao: l.participacao,
            valor: l.valor,
            efeito: l.geraCredito ? "Passará a exigir crédito de CBS/IBS" : "Não exige crédito de CBS/IBS",
          }))}
        />

        <p className="mt-6 text-[10.5pt] leading-relaxed text-ink/85">
          Também olhamos para as suas compras, que somam {brlExato(fornecedores.total)}. O perfil dos seus fornecedores
          influencia o quanto a sua empresa poderá aproveitar de créditos no novo sistema:
        </p>
        <TabelaPerfil
          titulo="Perfil do fornecedor"
          colunaValor="% das compras"
          linhas={fornecedores.linhas.map((l) => ({
            perfil: l.regime,
            participacao: l.participacao,
            valor: l.valor,
            efeito: l.geraCredito ? "Gera crédito de CBS/IBS" : "Não gera crédito de CBS/IBS",
          }))}
        />

        <div className="mt-6 grid grid-cols-3 gap-3">
          {[
            { r: "Crédito estimado de IBS (18,70%)", v: brlExato(fornecedores.totalIbs) },
            { r: "Crédito estimado de CBS (9,21%)", v: brlExato(fornecedores.totalCbs) },
            { r: "Compras sem direito a crédito", v: brlExato(fornecedores.totalSemCredito) },
          ].map((c) => (
            <div key={c.r} className="border border-line bg-frost px-3 py-3">
              <p className="text-[8pt] uppercase tracking-wide text-ink/55">{c.r}</p>
              <p className="mt-1 font-display text-[12pt] font-semibold">{c.v}</p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-[8pt] italic leading-snug text-ink/55">
          * Créditos estimados com as alíquotas de referência de {pct(ALIQUOTA_IBS)} (IBS) e {pct(ALIQUOTA_CBS)} (CBS).
          Alterações relevantes no perfil de clientes ou fornecedores exigem reavaliação da análise.
        </p>
      </Pagina>

      {/* Orientação */}
      <Pagina rodape={rodape} numero={4} total={5}>
        <Cabecalho />
        <h2 className="font-display text-[14pt] font-semibold">Nossa orientação para a sua empresa</h2>
        <div className="mt-4 border-l-4 border-accent-warm bg-frost px-4 py-3">
          <p className="font-display text-[11.5pt] font-semibold">{d.orientacaoTitulo}</p>
        </div>
        <Paragrafos texto={d.orientacao} />
        <p className="mt-3 text-[10.5pt] leading-relaxed text-ink/85">
          Hoje, {pct(participacaoNormal)} do seu faturamento vem de clientes que passarão a exigir crédito integral de
          CBS e IBS.
        </p>

        {totaisCenarios.length > 0 ? (
          <>
            <h3 className="mt-8 font-display text-[12pt] font-semibold text-brand">
              Simulações tributárias · cenário 2027
            </h3>
            <table className="mt-3 w-full border-collapse text-[9.5pt]">
              <thead>
                <tr className="bg-frost text-left">
                  <th className="border border-line px-2 py-1.5 font-display font-semibold">Cenário</th>
                  <th className="border border-line px-2 py-1.5 font-display font-semibold">Carga total projetada</th>
                </tr>
              </thead>
              <tbody>
                {totaisCenarios.map((c) => (
                  <tr key={c.label}>
                    <td className="border border-line px-2 py-1.5">{c.label}</td>
                    <td className="border border-line px-2 py-1.5">{brlExato(c.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        ) : null}

        <h3 className="mt-8 font-display text-[12pt] font-semibold text-brand">Próximos passos</h3>
        <Lista texto={d.proximosPassos} />

        <h3 className="mt-6 font-display text-[12pt] font-semibold text-brand">Análise Tributária Completa</h3>
        <Lista texto={d.pacote} />
      </Pagina>

      {/* Encerramento */}
      <Pagina rodape={rodape} numero={5} total={5}>
        <Cabecalho />
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <p className="font-display text-[13pt] font-semibold">
            Tem interesse em seguir com a Análise Tributária Completa?
          </p>
          <p className="mt-4 max-w-[120mm] text-[10.5pt] leading-relaxed text-ink/80">
            Entre em contato com o nosso escritório para que possamos apresentar todos os detalhes, valores e prazos.
          </p>
          <p className="mt-4 text-[11pt] font-medium">
            {d.telefone} · {d.email}
          </p>
          <span className="mt-10 block h-[3px] w-24 bg-accent-warm" />
          <p className="mt-10 max-w-[130mm] font-display text-[13pt] leading-snug text-ink/85">{d.encerramento}</p>
          <img src={logoLogica.url} alt="Lógica" className="mt-12 h-16 w-auto mix-blend-multiply" />
        </div>
      </Pagina>
    </div>
  );
}
