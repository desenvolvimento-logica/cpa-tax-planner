import capa from "@/assets/capa-diagnostico.jpg";
import logoLogica from "@/assets/logica-na-reforma.jpg.asset.json";
import {
  ALIQUOTA_CBS,
  CENARIOS,
  agruparPorRegime,
  brlExato,
  ORDEM_TRIBUTOS,
  ordenarTributos,
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
          <p key={i} className={className ?? "mt-3 w-full text-justify text-[10.5pt] leading-relaxed text-ink/85"}>
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
    <ul className="mt-3 w-full space-y-2">
      {itens.map((item, i) => (
        <li key={i} className="text-justify text-[10.5pt] leading-relaxed text-ink/85">
          <span className="mx-auto mb-1 block h-[2px] w-6 bg-accent-warm" />
          {item}
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
    <div className="pagina-doc relative mx-auto mb-6 flex h-[297mm] w-[210mm] flex-col overflow-hidden bg-white shadow-[0_18px_50px_-25px_rgba(0,0,0,0.4)] print:mb-0">
      <div
        className={
          semPadding
            ? "flex min-h-0 flex-1 flex-col overflow-hidden"
            : "flex min-h-0 flex-1 flex-col overflow-hidden px-[18mm] pt-[16mm] pb-[6mm]"
        }
      >
        {children}
      </div>
      {rodape ? (
        <div className="mt-auto shrink-0 bg-white px-[18mm] pb-[10mm]">
          <div className="border-t border-line pt-2 text-center text-[7.5pt] leading-snug text-ink/55">
            {rodape}
            {numero ? (
              <span className="ml-2">
                · Página {numero} de {total}
              </span>
            ) : null}
          </div>
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

function Titulo({ children }: { children: React.ReactNode }) {
  return <h3 className="mt-8 text-center font-display text-[12pt] font-semibold text-brand">{children}</h3>;
}

function TabelaPerfil({
  titulo,
  colunaValor,
  colunaCredito,
  linhas,
}: {
  titulo: string;
  colunaValor: string;
  colunaCredito: string;
  linhas: { perfil: string; participacao: number; valor: number; cbs: number; efeito: string }[];
}) {
  const totalValor = linhas.reduce((a, b) => a + b.valor, 0);
  const totalCbs = linhas.reduce((a, b) => a + b.cbs, 0);
  return (
    <table className="mt-4 w-full border-collapse text-[9pt]">
      <thead>
        <tr className="bg-frost text-center">
          <th className="border border-line px-2 py-1.5 font-display font-semibold">{titulo}</th>
          <th className="border border-line px-2 py-1.5 font-display font-semibold">%</th>
          <th className="border border-line px-2 py-1.5 font-display font-semibold">{colunaValor}</th>
          <th className="border border-line px-2 py-1.5 font-display font-semibold">
            CBS {pct(ALIQUOTA_CBS)}
          </th>
          <th className="border border-line px-2 py-1.5 font-display font-semibold">{colunaCredito}</th>
        </tr>
      </thead>
      <tbody className="text-center">
        {linhas.map((l) => (
          <tr key={l.perfil}>
            <td className="border border-line px-2 py-1.5">{l.perfil}</td>
            <td className="border border-line px-2 py-1.5">{pct(l.participacao)}</td>
            <td className="border border-line px-2 py-1.5">{brlExato(l.valor)}</td>
            <td className="border border-line px-2 py-1.5">{brlExato(l.cbs)}</td>
            <td className="border border-line px-2 py-1.5 text-ink/75">{l.efeito}</td>
          </tr>
        ))}
        <tr className="bg-frost font-display font-semibold">
          <td className="border border-line px-2 py-1.5">Total</td>
          <td className="border border-line px-2 py-1.5">100,00%</td>
          <td className="border border-line px-2 py-1.5">{brlExato(totalValor)}</td>
          <td className="border border-line px-2 py-1.5">{brlExato(totalCbs)}</td>
          <td className="border border-line px-2 py-1.5" />
        </tr>
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
  const folha = soma(estudo.folha);
  const participacaoNormal = clientes.linhas
    .filter((l) => l.geraCredito)
    .reduce((a, b) => a + b.participacao, 0);

  const cenarios = CENARIOS.map((c) => ({
    ...c,
    total: soma(estudo.simulacoes[c.key]),
    tributos: ordenarTributos(estudo.simulacoes.tributos?.[c.key] ?? []),
  })).filter((c) => c.total > 0);

  const temCnaes = estudo.cnaes.length > 0;
  const total = temCnaes ? 6 : 5;
  let n = 1;

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
      <Pagina rodape={rodape} numero={++n} total={total}>
        <Cabecalho />
        <h2 className="text-center font-display text-[14pt] font-semibold">{d.saudacao}</h2>
        <Paragrafos texto={d.introducao} />
        <Titulo>O que muda com a Reforma Tributária</Titulo>
        <Paragrafos texto={d.oQueMuda} />
      </Pagina>

      {/* Comparativo Simples tradicional x Híbrido */}
      <Pagina rodape={rodape} numero={++n} total={total}>
        <Cabecalho />
        <h2 className="text-center font-display text-[14pt] font-semibold">
          Simples tradicional e Simples Híbrido lado a lado
        </h2>
        <table className="mt-5 w-full border-collapse text-[9.5pt]">
          <thead>
            <tr className="bg-frost text-center">
              <th className="border border-line px-2 py-1.5 font-display font-semibold">Como fica</th>
              <th className="border border-line px-2 py-1.5 font-display font-semibold">Simples tradicional</th>
              <th className="border border-line px-2 py-1.5 font-display font-semibold">Simples Híbrido</th>
            </tr>
          </thead>
          <tbody className="text-center">
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
              ["Demais tributos (IRPJ, CSLL, CPP)", "Permanecem no Simples", "Permanecem no Simples"],
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
      </Pagina>

      {/* CNAEs */}
      {temCnaes ? (
        <Pagina rodape={rodape} numero={++n} total={total}>
          <Cabecalho />
          <h2 className="text-center font-display text-[14pt] font-semibold">Análise das atividades (CNAE)</h2>
          <p className="mt-3 w-full text-justify text-[10pt] leading-relaxed text-ink/80">
            Estas são as atividades registradas para a sua empresa, o que cada uma abrange e o anexo do Simples
            Nacional correspondente. O enquadramento define a alíquota do Simples e influencia diretamente o resultado
            das simulações apresentadas adiante.
          </p>
          <div className="mt-5 space-y-4">
            {estudo.cnaes.map((c) => (
              <div key={c.id} className="border border-line bg-frost/60 px-4 py-3 text-justify">
                <p className="text-center font-display text-[10.5pt] font-semibold">
                  {c.codigo} — {c.descricao}
                </p>
                <p className="mt-1 text-center text-[8.5pt] uppercase tracking-[0.15em] text-accent-warm">{c.anexo}</p>
                {c.compreende ? (
                  <p className="mt-2 text-justify text-[9pt] leading-relaxed text-ink/80">
                    <span className="font-semibold">Compreende: </span>
                    {c.compreende}
                  </p>
                ) : null}
                {c.naoCompreende ? (
                  <p className="mt-2 text-justify text-[9pt] leading-relaxed text-ink/70">
                    <span className="font-semibold">Não compreende: </span>
                    {c.naoCompreende}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        </Pagina>
      ) : null}

      {/* Prazos + análise */}
      <Pagina rodape={rodape} numero={++n} total={total}>
        <Cabecalho />
        <Titulo>Atenção ao prazo</Titulo>
        <Paragrafos texto={d.prazos} />

        <Titulo>A análise que fizemos para você</Titulo>
        <p className="mt-3 w-full text-justify text-[10.5pt] leading-relaxed text-ink/85">
          Analisamos as vendas da sua empresa no ano-base de {d.anoBase}, somando {brlExato(faturamento)}. Veja como o
           seu faturamento se distribui entre os perfis de cliente e quanto de débito de CBS cada perfil
          representa:
        </p>
        {folha > 0 ? (
          <p className="mt-3 w-full text-justify text-[10.5pt] leading-relaxed text-ink/85">
            No mesmo período, a folha de pagamento acumulada foi de {brlExato(folha)}, considerando o valor Base total
            informado na seção INSS do Resumo da Folha.
          </p>
        ) : null}
        {estudo.tributacoesNacionais.length > 0 ? (
          <>
            <Titulo>Códigos de Tributação Nacional das notas emitidas</Titulo>
            <table className="mt-3 w-full border-collapse text-[8.5pt]">
              <thead>
                <tr className="bg-frost text-center">
                  <th className="border border-line px-2 py-1.5">Código</th>
                  <th className="border border-line px-2 py-1.5">Descrição</th>
                   <th className="border border-line px-2 py-1.5">ISS (%)</th>
                </tr>
              </thead>
              <tbody className="text-center">
                {estudo.tributacoesNacionais.map((item) => (
                  <tr key={item.id}>
                    <td className="border border-line px-2 py-1.5 font-medium">{item.codigo}</td>
                    <td className="border border-line px-2 py-1.5">{item.descricao || "—"}</td>
                    <td className="border border-line px-2 py-1.5">{item.aliquotaIss.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        ) : null}
        <TabelaPerfil
          titulo="Perfil do cliente"
          colunaValor="Faturamento"
          colunaCredito="Efeito com a reforma"
          linhas={clientes.linhas.map((l) => ({
            perfil: l.regime,
            participacao: l.participacao,
            valor: l.valor,
            cbs: l.cbsPotencial,
            efeito: l.geraCredito ? "Passará a exigir crédito integral" : "Não aproveita crédito",
          }))}
        />

        <p className="mt-6 w-full text-justify text-[10.5pt] leading-relaxed text-ink/85">
          Também olhamos para as suas compras, que somam {brlExato(fornecedores.total)}. O perfil dos seus fornecedores
          define quanto de crédito a sua empresa poderá aproveitar no novo sistema:
        </p>
        <TabelaPerfil
          titulo="Perfil do fornecedor"
          colunaValor="Compras"
          colunaCredito="Efeito com a reforma"
          linhas={fornecedores.linhas.map((l) => ({
            perfil: l.regime,
            participacao: l.participacao,
            valor: l.valor,
            cbs: l.cbsPotencial,
            efeito: l.geraCredito ? "Gera crédito de CBS" : "Sem direito a crédito",
          }))}
        />

        <div className="mt-6 grid grid-cols-2 gap-3 text-center">
          {[
            { r: "Crédito efetivo de CBS", v: brlExato(fornecedores.totalCbs) },
            { r: "Compras sem direito a crédito", v: brlExato(fornecedores.totalSemCredito) },
          ].map((c) => (
            <div key={c.r} className="border border-line bg-frost px-3 py-3">
              <p className="text-[8pt] uppercase tracking-wide text-ink/55">{c.r}</p>
              <p className="mt-1 font-display text-[12pt] font-semibold">{c.v}</p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-justify text-[8pt] italic leading-snug text-ink/55">
          * Valores calculados com a alíquota de referência de {pct(ALIQUOTA_CBS)} para a CBS em 2027.
          Nas linhas de fornecedores do Simples Nacional, MEI e pessoa física os valores indicam o crédito que se
          perderia, e não integram o crédito efetivo. Hoje, {pct(participacaoNormal)} do seu faturamento vem de
           clientes que passarão a exigir crédito integral de CBS.
        </p>
      </Pagina>

      {/* Simulações */}
      <Pagina rodape={rodape} numero={++n} total={total}>
        <Cabecalho />
        <h2 className="text-center font-display text-[14pt] font-semibold">Simulações tributárias · cenário 2027</h2>
        {cenarios.length > 0 ? (
          <>
            <table className="mt-4 w-full border-collapse text-[8.5pt]">
              <thead>
                <tr className="bg-frost text-center">
                  <th className="border border-line px-2 py-1.5 font-display font-semibold">Indicador</th>
                  {cenarios.map((c) => (
                    <th key={c.key} className="border border-line px-2 py-1.5 font-display font-semibold">
                      {c.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="text-center">
                <tr>
                  <td className="border border-line px-2 py-1.5 font-medium">Carga total projetada</td>
                  {cenarios.map((c) => (
                    <td key={c.key} className="border border-line px-2 py-1.5 font-display font-semibold">
                      {brlExato(c.total)}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="border border-line px-2 py-1.5 font-medium">% do faturamento</td>
                  {cenarios.map((c) => (
                    <td key={c.key} className="border border-line px-2 py-1.5">
                      {faturamento > 0 ? pct(c.total / faturamento) : "—"}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="border border-line px-2 py-1.5 font-medium">Diferença vs. Simples atual</td>
                  {cenarios.map((c) => {
                    const base = cenarios.find((x) => x.key === "simplesAtual")?.total ?? 0;
                    const diff = c.total - base;
                    if (c.key === "simplesAtual") {
                      return <td key={c.key} className="border border-line px-2 py-1.5 text-ink/50">—</td>;
                    }
                    return (
                      <td
                        key={c.key}
                        className={`border border-line px-2 py-1.5 font-medium ${diff > 0 ? "text-destructive" : "text-brand"}`}
                      >
                        {diff > 0 ? "+" : ""}
                        {brlExato(diff)}
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>

            <Titulo>Composição por tributo · total do ano</Titulo>
            <table className="mt-3 w-full border-collapse text-[8pt]">
              <thead>
                <tr className="bg-frost text-center">
                  <th className="border border-line px-2 py-1.5 font-display font-semibold">Tributo</th>
                  {cenarios.map((c) => (
                    <th key={c.key} className="border border-line px-2 py-1.5 font-display font-semibold">
                      {c.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="text-center">
                {ORDEM_TRIBUTOS.map((nome) => (
                  <tr key={nome}>
                    <td className="border border-line px-2 py-1.5 font-medium">{nome}</td>
                    {cenarios.map((c) => {
                      const valor = c.tributos.find((t) => t.nome === nome)?.valor ?? 0;
                      return (
                        <td key={c.key} className="border border-line px-2 py-1.5 tabular-nums">
                          {valor !== 0 ? brlExato(valor) : "—"}
                        </td>
                      );
                    })}
                  </tr>
                ))}
                {cenarios.some((c) => c.tributos.length === 0) && (
                  <tr>
                    <td colSpan={cenarios.length + 1} className="border border-line px-2 py-1.5 text-ink/55">
                      Detalhamento por tributo não disponível para cenários sem composição importada.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </>
        ) : (
          <p className="mt-4 text-justify text-[10pt] text-ink/70">Simulações ainda não importadas.</p>
        )}
      </Pagina>

      {/* Encerramento */}
      <Pagina rodape={rodape} numero={++n} total={total}>
        <Cabecalho />
        <h2 className="text-center font-display text-[14pt] font-semibold">Próximos passos</h2>
        <Lista texto={d.proximosPassos} />

        <div className="mt-auto flex w-full flex-col items-center text-center">
          <p className="w-full text-[11pt] font-medium">
            {d.telefone} · {d.email}
          </p>
          <span className="mt-8 block h-[3px] w-24 bg-accent-warm" />
          <p className="mt-8 w-full font-display text-[13pt] leading-snug text-ink/85">{d.encerramento}</p>
          <img src={logoLogica.url} alt="Lógica" className="mt-10 h-16 w-auto mix-blend-multiply" />
        </div>
      </Pagina>
    </div>
  );
}
