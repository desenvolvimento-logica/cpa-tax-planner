import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { brl, CENARIOS, MESES, soma, type Simulacoes } from "@/lib/estudo";
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

  const dadosGrafico = MESES.map((mes, i) => ({
    mes,
    "Simples atual": simulacoes.simplesAtual[i] ?? 0,
    "Simples híbrido": simulacoes.simplesHibrido[i] ?? 0,
    "Lucro Presumido": simulacoes.lucroPresumido[i] ?? 0,
    "Lucro Real": simulacoes.lucroReal[i] ?? 0,
  }));

  const editar = (key: keyof Simulacoes, mes: number, valor: number) =>
    onChange({ ...simulacoes, [key]: simulacoes[key].map((v, i) => (i === mes ? valor : v)) });

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

      <div className="mt-6 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={dadosGrafico} margin={{ left: -12, right: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-line)" vertical={false} />
            <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 10 }} tickFormatter={(v: number) => `${Math.round(v / 1000)}k`} />
            <Tooltip formatter={(v: number) => brl(v)} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="Simples atual" fill={CORES["simplesAtual"]} />
            <Bar dataKey="Simples híbrido" fill={CORES["simplesHibrido"]} />
            <Bar dataKey="Lucro Presumido" fill={CORES["lucroPresumido"]} />
            <Bar dataKey="Lucro Real" fill={CORES["lucroReal"]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-4">
        {totais.map((t) => {
          const diferenca = atual.total - t.total;
          return (
            <div
              key={t.key}
              className={`clip-tilt p-5 ring-1 ${
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
