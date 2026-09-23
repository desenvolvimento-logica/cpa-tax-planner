import { brl, type ResumoNcm } from "@/lib/estudo";

export function TabelaNcm({ itens, documento = false }: { itens: ResumoNcm[]; documento?: boolean }) {
  const total = itens.reduce((s, i) => s + i.valor, 0);
  const qtd = itens.reduce((s, i) => s + i.itens, 0);
  const cel = documento ? "border border-line px-2 py-1.5" : "py-2 pr-2";
  return (
    <div className="mt-3 overflow-x-auto">
      <table className={documento ? "w-full border-collapse text-center text-[8.5pt]" : "w-full min-w-[560px] text-left text-sm"}>
        <thead>
          <tr className={documento ? "bg-frost" : "border-b border-line text-[11px] uppercase tracking-widest text-muted-foreground"}>
            <th className={`${cel} font-medium`}>NCM</th>
            <th className={`${cel} font-medium`}>Produto</th>
            <th className={`${cel} font-medium`}>CST IBS/CBS</th>
            <th className={`${cel} font-medium`}>cClassTrib</th>
            <th className={`${cel} text-right font-medium`}>Itens</th>
            <th className={`${cel} text-right font-medium`}>Valor</th>
          </tr>
        </thead>
        <tbody>
          {itens.map((i) => (
            <tr key={`${i.ncm}-${i.cst}-${i.cClassTrib}`} className={documento ? "" : "border-b border-line/70"}>
              <td className={`${cel} font-medium`}>{i.ncm}</td>
              <td className={`${cel} break-words text-ink/70`}>{i.descricao || "—"}</td>
              <td className={cel}>{i.cst || "—"}</td>
              <td className={cel}>{i.cClassTrib}</td>
              <td className={`${cel} text-right`}>{i.itens}</td>
              <td className={`${cel} text-right`}>{brl(i.valor)}</td>
            </tr>
          ))}
          <tr className="font-semibold">
            <td className={cel} colSpan={4}>Total</td>
            <td className={`${cel} text-right`}>{qtd}</td>
            <td className={`${cel} text-right`}>{brl(total)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
