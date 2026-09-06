import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ALIQUOTA_CBS,
  ALIQUOTA_IBS,
  agruparPorRegime,
  brl,
  CORES_REGIME,
  pct,
  REGIMES_COM_CREDITO,
  type Parceiro,

} from "@/lib/estudo";
import { BotaoLinha, CampoTexto, CampoValor, Painel, SeletorRegime } from "./campos";

type Props = {
  numero: string;
  tipo: "fornecedores" | "clientes";
  itens: Parceiro[];
  onChange: (itens: Parceiro[]) => void;
};

export function SecaoParceiros({ numero, tipo, itens, onChange }: Props) {
  const resumo = agruparPorRegime(itens);
  const fornecedor = tipo === "fornecedores";
  const titulo = fornecedor ? "Fornecedores por regime tributário" : "Clientes por regime tributário";

  const atualizar = (id: string, patch: Partial<Parceiro>) =>
    onChange(itens.map((i) => (i.id === id ? { ...i, ...patch } : i)));

  const adicionar = () =>
    onChange([
      ...itens,
      {
        id: crypto.randomUUID(),
        nome: "",
        cnpj: "",
        regime: "Lucro Presumido",
        valor: 0,
      },
    ]);

  const dadosPizza = resumo.linhas.map((l) => ({
    name: l.regime,
    value: l.valor,
    cor: CORES_REGIME[l.regime],
  }));

  const dadosBarra = resumo.linhas.map((l) => ({
    regime: l.regime.replace(" (Pessoa Física)", " PF"),
    IBS: Math.round(l.ibs),
    CBS: Math.round(l.cbs),
  }));

  return (
    <Painel
      numero={numero}
      titulo={titulo}
      acessorio={<BotaoLinha onClick={adicionar}>+ Adicionar {fornecedor ? "fornecedor" : "cliente"}</BotaoLinha>}
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-line text-[11px] uppercase tracking-widest text-muted-foreground">
              <th className="py-2 text-left font-medium">{fornecedor ? "Fornecedor" : "Cliente"}</th>
              <th className="py-2 text-left font-medium">CNPJ / CPF</th>
              <th className="py-2 text-left font-medium">Regime</th>
              <th className="py-2 text-right font-medium">{fornecedor ? "Compras" : "Vendas"}</th>
              <th className="py-2 text-right font-medium">Crédito IBS</th>
              <th className="py-2 text-right font-medium">Crédito CBS</th>
              <th className="w-8" />
            </tr>
          </thead>
          <tbody>
            {itens.map((item) => {
              const gera = REGIMES_COM_CREDITO.includes(item.regime);
              return (
                <tr key={item.id} className="border-b border-line/70 align-middle">
                  <td className="py-1">
                    <div className="flex items-center gap-2">
                      <CampoTexto
                        valor={item.nome}
                        onChange={(v) => atualizar(item.id, { nome: v })}
                        placeholder="Razão social"
                      />
                      {!gera && (
                        <span className="shrink-0 rounded-full bg-accent-warm/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-accent-warm">
                          sem crédito
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-1">
                    <CampoTexto
                      valor={item.cnpj}
                      onChange={(v) => atualizar(item.id, { cnpj: v })}
                      placeholder="00.000.000/0001-00"
                    />
                  </td>
                  <td className="py-1">
                    <SeletorRegime valor={item.regime} onChange={(v) => atualizar(item.id, { regime: v })} />
                  </td>
                  <td className="py-1">
                    <CampoValor valor={item.valor} onChange={(v) => atualizar(item.id, { valor: v })} />
                  </td>
                  <td className="py-1 pr-2 text-right tabular-nums">
                    {gera ? brl(item.valor * ALIQUOTA_IBS) : "—"}
                  </td>
                  <td className="py-1 pr-2 text-right tabular-nums">
                    {gera ? brl(item.valor * ALIQUOTA_CBS) : "—"}
                  </td>
                  <td className="py-1 text-right">
                    <button
                      type="button"
                      aria-label="Remover"
                      onClick={() => onChange(itens.filter((i) => i.id !== item.id))}
                      className="no-print rounded-full px-2 text-muted-foreground transition-colors hover:text-destructive"
                    >
                      ×
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <h3 className="mt-8 font-display text-xs font-semibold uppercase tracking-widest text-ink/60">
        Consolidado por regime
      </h3>
      <div className="mt-3 grid gap-6 lg:grid-cols-2">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[420px] text-sm">
            <thead>
              <tr className="border-b border-line text-[11px] uppercase tracking-widest text-muted-foreground">
                <th className="py-2 text-left font-medium">Regime</th>
                <th className="py-2 text-right font-medium">%</th>
                <th className="py-2 text-right font-medium">Valor</th>
                <th className="py-2 text-right font-medium">IBS + CBS</th>
              </tr>
            </thead>
            <tbody>
              {resumo.linhas.map((l) => (
                <tr key={l.regime} className="border-b border-line/70">
                  <td className="py-2">
                    <span className="flex items-center gap-2">
                      <span className="size-2.5 rounded-full" style={{ backgroundColor: CORES_REGIME[l.regime] }} />
                      <span className={l.geraCredito ? "" : "font-semibold text-accent-warm"}>{l.regime}</span>
                    </span>
                  </td>
                  <td className="py-2 text-right tabular-nums">{pct(l.participacao)}</td>
                  <td className="py-2 text-right tabular-nums">{brl(l.valor)}</td>
                  <td className="py-2 text-right tabular-nums">
                    {l.geraCredito ? brl(l.ibs + l.cbs) : "—"}
                  </td>
                </tr>
              ))}
              <tr className="font-semibold">
                <td className="py-2">Total</td>
                <td className="py-2 text-right tabular-nums">100,0%</td>
                <td className="py-2 text-right tabular-nums">{brl(resumo.total)}</td>
                <td className="py-2 text-right tabular-nums">{brl(resumo.totalIbs + resumo.totalCbs)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={dadosPizza} dataKey="value" nameKey="name" innerRadius="52%" outerRadius="88%" stroke="none">
                  {dadosPizza.map((d) => (
                    <Cell key={d.name} fill={d.cor} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => brl(v)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dadosBarra} margin={{ left: -18 }}>
                <XAxis dataKey="regime" tick={{ fontSize: 9 }} interval={0} />
                <YAxis tick={{ fontSize: 9 }} tickFormatter={(v: number) => `${Math.round(v / 1000)}k`} />
                <Tooltip formatter={(v: number) => brl(v)} />
                <Bar dataKey="IBS" stackId="a" fill="var(--color-brand)" />
                <Bar dataKey="CBS" stackId="a" fill="var(--color-accent-warm)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="clip-tilt bg-gradient-to-br from-brand to-ink p-5 text-primary-foreground">
          <p className="text-xs opacity-75">Crédito estimado · IBS 18,70%</p>
          <p className="mt-2 font-display text-2xl font-semibold leading-none">{brl(resumo.totalIbs)}</p>
        </div>
        <div className="clip-tilt bg-gradient-to-br from-ink to-brand p-5 text-primary-foreground">
          <p className="text-xs opacity-75">Crédito estimado · CBS 9,21%</p>
          <p className="mt-2 font-display text-2xl font-semibold leading-none">{brl(resumo.totalCbs)}</p>
        </div>
        <div className="clip-tilt bg-frost p-5 ring-1 ring-line">
          <p className="text-xs text-muted-foreground">Total de créditos</p>
          <p className="mt-2 font-display text-2xl font-semibold leading-none text-brand">
            {brl(resumo.totalIbs + resumo.totalCbs)}
          </p>
        </div>
      </div>

      {resumo.totalSemCredito > 0 && (
        <div className="mt-4 flex items-start gap-2 rounded-lg bg-accent-warm/10 p-3 ring-1 ring-accent-warm/30">
          <span className="mt-0.5 grid size-4 shrink-0 place-items-center rounded-full bg-accent-warm text-[10px] font-bold text-primary-foreground">
            !
          </span>
          <p className="text-xs text-ink/80">
            {fornecedor ? (
              <>
                <span className="font-semibold">Atenção:</span>{" "}
                {pct(resumo.total > 0 ? resumo.totalSemCredito / resumo.total : 0)} das compras (
                {brl(resumo.totalSemCredito)}) vêm de fornecedores do Simples Nacional, MEI ou pessoa física — a empresa{" "}
                <span className="font-semibold">não se creditará</span> de IBS/CBS sobre esses valores. Recomenda-se
                abordar esses fornecedores sobre migração de regime ou renegociação de preço.
              </>
            ) : (
              <>
                <span className="font-semibold">Atenção:</span>{" "}
                {pct(resumo.total > 0 ? resumo.totalSemCredito / resumo.total : 0)} do faturamento (
                {brl(resumo.totalSemCredito)}) vai para clientes do Simples Nacional, MEI ou pessoa física, que não
                aproveitam crédito. Os clientes de regime normal aproveitariam{" "}
                <span className="font-semibold">{brl(resumo.totalIbs + resumo.totalCbs)}</span> em créditos de IBS/CBS
                caso a empresa passe a destacar os tributos integralmente.
              </>
            )}
          </p>
        </div>
      )}
    </Painel>
  );
}
