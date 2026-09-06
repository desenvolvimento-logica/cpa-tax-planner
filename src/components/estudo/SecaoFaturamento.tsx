import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { brl, MESES, soma } from "@/lib/estudo";
import { CampoValor, Painel } from "./campos";

export function SecaoFaturamento({
  valores,
  onChange,
}: {
  valores: number[];
  onChange: (v: number[]) => void;
}) {
  const total = soma(valores);
  const media = total / 12;
  const dados = MESES.map((mes, i) => ({ mes, valor: valores[i] ?? 0 }));

  return (
    <Painel
      numero="03"
      titulo="Faturamento mensal"
      acessorio={
        <div className="text-right">
          <p className="text-[11px] uppercase tracking-widest text-muted-foreground">Total no período</p>
          <p className="font-display text-2xl font-semibold leading-none">{brl(total)}</p>
        </div>
      }
    >
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={dados} margin={{ left: -12, right: 8, top: 8 }}>
            <defs>
              <linearGradient id="grad-fat" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-brand)" stopOpacity={0.45} />
                <stop offset="100%" stopColor="var(--color-brand)" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 10 }} tickFormatter={(v: number) => `${Math.round(v / 1000)}k`} />
            <Tooltip formatter={(v: number) => brl(v)} />
            <Area type="monotone" dataKey="valor" stroke="var(--color-brand)" strokeWidth={2} fill="url(#grad-fat)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-6 grid gap-x-6 gap-y-1 sm:grid-cols-2 lg:grid-cols-3">
        {MESES.map((mes, i) => (
          <div key={mes} className="flex items-center gap-3 border-b border-line/70 py-1">
            <span className="w-10 text-xs uppercase tracking-wide text-muted-foreground">{mes}</span>
            <div className="h-1.5 flex-1 rounded-full bg-line">
              <div
                className="h-full rounded-full bg-brand"
                style={{ width: `${Math.min(100, ((valores[i] ?? 0) / Math.max(1, Math.max(...valores))) * 100)}%` }}
              />
            </div>
            <CampoValor
              valor={valores[i] ?? 0}
              onChange={(v) => onChange(valores.map((x, idx) => (idx === i ? v : x)))}
              className="w-32"
            />
          </div>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap gap-4">
        <div className="clip-bar bg-frost px-5 py-3 ring-1 ring-line">
          <p className="text-[11px] uppercase tracking-widest text-muted-foreground">Média mensal</p>
          <p className="font-display text-xl font-semibold">{brl(media)}</p>
        </div>
        <div className="clip-bar bg-frost px-5 py-3 ring-1 ring-line">
          <p className="text-[11px] uppercase tracking-widest text-muted-foreground">Receita bruta acumulada (RBT12)</p>
          <p className="font-display text-xl font-semibold">{brl(total)}</p>
        </div>
      </div>
    </Painel>
  );
}
