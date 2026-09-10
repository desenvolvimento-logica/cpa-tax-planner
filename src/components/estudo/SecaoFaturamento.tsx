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
    </Painel>
  );
}
