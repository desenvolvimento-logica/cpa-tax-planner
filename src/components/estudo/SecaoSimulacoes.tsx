import { brl, CENARIOS, MESES, soma, type CenarioKey, type Simulacoes } from "@/lib/estudo";
import { CampoValor, Painel } from "./campos";

const CORES: Record<string, string> = {
  simplesAtual: "var(--color-ink)",
  simplesHibrido: "var(--color-brand)",
  lucroPresumido: "var(--color-line)",
  lucroReal: "var(--color-accent-warm)",
};

export function SecaoSimulacoes({
  simulacoes,
  faturamento,
  onChange,
}: {
  simulacoes: Simulacoes;
  faturamento: number[];
  onChange: (s: Simulacoes) => void;
}) {
  const totais = CENARIOS.map((c) => ({ ...c, total: soma(simulacoes[c.key]) }));
  const melhor = totais.reduce((a, b) => (b.total > 0 && (a.total === 0 || b.total < a.total) ? b : a), totais[0]!);
  const atual = totais.find((t) => t.key === "simplesAtual")!;
  const receita = soma(faturamento);

  const editar = (key: CenarioKey, mes: number, valor: number) =>
    onChange({ ...simulacoes, [key]: simulacoes[key].map((v, i) => (i === mes ? valor : v)) });

  const tributosDe = (key: CenarioKey) => (simulacoes.tributos?.[key] ?? []).filter((t) => t.valor !== 0);

  return (
    <Painel
      numero="05"
      titulo="Simulações tributárias · cenário 2027"
      acessorio={<span className="text-[11px] uppercase tracking-widest text-muted-foreground">Valores mensais em R$</span>}
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[980px] text-sm">
          <thead>
            <tr className="border-b border-line text-[11px] uppercase tracking-widest text-muted-foreground">
              <th className="py-2 text-left font-medium">Cenário</th>
              {MESES.map((m) => (
                <th key={m} className="py-2 text-right font-medium">
                  {m}
                </th>
              ))}
              <th className="py-2 text-right font-medium">Total</th>
            </tr>
          </thead>
          <tbody>
            {CENARIOS.map((c) => {
              const total = soma(simulacoes[c.key]);
              const ehMelhor = c.key === melhor.key && total > 0;
              return (
                <tr key={c.key} className={`border-b border-line/70 ${ehMelhor ? "bg-accent-warm/10" : ""}`}>
                  <td className="py-1 pr-3">
                    <span className="flex items-center gap-2 whitespace-nowrap">
                      <span className="size-2.5 rounded-full" style={{ backgroundColor: CORES[c.key] }} />
                      <span className="font-medium">{c.label}</span>
                      {ehMelhor && (
                        <span className="rounded bg-accent-warm px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground">
                          MENOR CARGA
                        </span>
                      )}
                    </span>
                  </td>
                  {MESES.map((m, i) => (
                    <td key={m} className="py-1">
                      <CampoValor
                        valor={simulacoes[c.key][i] ?? 0}
                        onChange={(v) => editar(c.key, i, v)}
                        className="w-24"
                      />
                    </td>
                  ))}
                  <td className="py-1 pr-2 text-right font-display font-semibold tabular-nums">{brl(total)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <h3 className="mt-8 font-display text-xs font-semibold uppercase tracking-widest text-ink/60">
        Comparativo dos regimes · total do ano e composição por tributo
      </h3>

      <div className="mt-3 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {totais.map((t) => {
          const diferenca = atual.total - t.total;
          const tributos = tributosDe(t.key);
          return (
            <div
              key={t.key}
              className={`rounded-xl p-5 ring-1 ${
                t.key === melhor.key ? "bg-accent-warm/10 ring-accent-warm/40" : "bg-frost ring-line"
              }`}
            >
              <p className="text-xs text-muted-foreground">{t.label}</p>
              <p className="mt-2 font-display text-xl font-semibold leading-none">{brl(t.total)}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                {receita > 0 ? `${((t.total / receita) * 100).toFixed(2).replace(".", ",")}% da receita` : "—"}
              </p>
              {t.key !== "simplesAtual" && (
                <p className={`mt-1 text-xs font-medium ${diferenca >= 0 ? "text-brand" : "text-destructive"}`}>
                  {diferenca >= 0 ? "Economia" : "Custo adicional"} de {brl(Math.abs(diferenca))} vs. Simples atual
                </p>
              )}

              <div className="mt-4 border-t border-line pt-3">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Por tributo (ano)
                </p>
                {tributos.length > 0 ? (
                  <ul className="mt-2 space-y-1 text-xs">
                    {tributos.map((trib) => (
                      <li key={trib.nome} className="flex items-baseline justify-between gap-2">
                        <span className="text-ink/70">{trib.nome}</span>
                        <span className="tabular-nums font-medium">{brl(trib.valor)}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Detalhamento por tributo não disponível neste relatório.
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-4 text-xs text-muted-foreground">
        Fontes: Simples Nacional atual e híbrido — relatório <em>Detalhamento Simulação de Cálculo da Reforma
        Tributária</em>, cenário 2027. Lucro Presumido e Lucro Real — relatório <em>Consulta Planejamento
        Tributário</em>, cenário 2027.
      </p>
    </Painel>
  );
}
