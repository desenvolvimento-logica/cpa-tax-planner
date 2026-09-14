import { brl, brlExato, MESES, soma, type TributacaoNacional } from "@/lib/estudo";
import { CampoValor, Painel } from "./campos";

export function SecaoFaturamento({
  valores,
  tributacoes,
  onChange,
  onChangeTributacoes,
}: {
  valores: number[];
  tributacoes: TributacaoNacional[];
  onChange: (v: number[]) => void;
  onChangeTributacoes: (v: TributacaoNacional[]) => void;
}) {
  const total = soma(valores);
  const meses = valores.filter((v) => v > 0).length;
  const media = meses ? total / meses : 0;

  return (
    <Painel numero="03" titulo="Faturamento mensal">
      <div className="grid gap-x-8 gap-y-1 sm:grid-cols-2 lg:grid-cols-3">
        {MESES.map((mes, i) => (
          <div key={mes} className="flex items-center gap-2 border-b border-line/70 py-1">
            <span className="w-10 text-xs uppercase tracking-wide text-muted-foreground">{mes}</span>
            <CampoValor
              valor={valores[i] ?? 0}
              onChange={(v) => onChange(valores.map((x, idx) => (idx === i ? v : x)))}
              className="flex-1"
            />
          </div>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap gap-4">
        <div className="clip-bar bg-frost px-5 py-3 ring-1 ring-line">
          <p className="text-[11px] uppercase tracking-widest text-muted-foreground">Meses com faturamento</p>
          <p className="font-display text-xl font-semibold">{meses}</p>
        </div>
        <div className="clip-bar bg-frost px-5 py-3 ring-1 ring-line">
          <p className="text-[11px] uppercase tracking-widest text-muted-foreground">Média mensal</p>
          <p className="font-display text-xl font-semibold">{brl(media)}</p>
        </div>
        <div className="clip-bar bg-frost px-5 py-3 ring-1 ring-line">
          <p className="text-[11px] uppercase tracking-widest text-muted-foreground">Receita acumulada</p>
          <p className="font-display text-xl font-semibold">{brl(total)}</p>
        </div>
      </div>

      <div className="mt-8 border-t border-line pt-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="font-display text-xs font-semibold uppercase tracking-widest text-brand">
            Cód. Tributação Nacional das notas emitidas
          </h3>
          <span className="text-[11px] text-muted-foreground">ISS preenchido manualmente por código</span>
        </div>
        {tributacoes.length ? (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[680px] text-sm">
              <thead>
                <tr className="border-b border-line text-[11px] uppercase tracking-widest text-muted-foreground">
                  <th className="py-2 text-left font-medium">Código</th>
                  <th className="py-2 text-left font-medium">Descrição</th>
                  <th className="py-2 text-right font-medium">Notas emitidas</th>
                  <th className="py-2 text-right font-medium">ISS (%)</th>
                  <th className="py-2 text-right font-medium">ISS estimado</th>
                </tr>
              </thead>
              <tbody>
                {tributacoes.map((item) => (
                  <tr key={item.id} className="border-b border-line/70">
                    <td className="py-2 pr-3 font-medium">{item.codigo}</td>
                    <td className="py-2 pr-3 text-ink/70">{item.descricao || "—"}</td>
                    <td className="py-2 pr-3 text-right tabular-nums">{brlExato(item.valorNotas)}</td>
                    <td className="w-28 py-1">
                      <CampoValor
                        valor={item.aliquotaIss}
                        onChange={(aliquotaIss) =>
                          onChangeTributacoes(tributacoes.map((atual) => atual.id === item.id ? { ...atual, aliquotaIss } : atual))
                        }
                        className="w-24"
                        placeholder="0,00"
                      />
                    </td>
                    <td className="py-2 text-right tabular-nums">
                      {brlExato(item.valorNotas * item.aliquotaIss / 100)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="mt-3 text-sm text-muted-foreground">
            Importe uma planilha de notas emitidas com uma coluna de Código de Tributação Nacional.
          </p>
        )}
      </div>
    </Painel>
  );
}
