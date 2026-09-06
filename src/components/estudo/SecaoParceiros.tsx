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
  const rotulo = fornecedor ? "Crédito" : "Débito";

  const atualizar = (id: string, patch: Partial<Parceiro>) =>
    onChange(itens.map((i) => (i.id === id ? { ...i, ...patch } : i)));

  const adicionar = () =>
    onChange([
      ...itens,
      { id: crypto.randomUUID(), nome: "", cnpj: "", regime: "Lucro Presumido", valor: 0 },
    ]);

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
              <th className="py-2 text-right font-medium">{rotulo} IBS</th>
              <th className="py-2 text-right font-medium">{rotulo} CBS</th>
              <th className="w-8" />
            </tr>
          </thead>
          <tbody>
            {itens.map((item) => {
              const gera = REGIMES_COM_CREDITO.includes(item.regime);
              const ibs = item.valor * ALIQUOTA_IBS;
              const cbs = item.valor * ALIQUOTA_CBS;
              // Fornecedores fora do regime normal: valor apenas indicativo (não entra no total).
              const informativo = fornecedor && !gera;
              return (
                <tr key={item.id} className="border-b border-line/70 align-middle">
                  <td className="py-1">
                    <div className="flex items-center gap-2">
                      <CampoTexto
                        valor={item.nome}
                        onChange={(v) => atualizar(item.id, { nome: v })}
                        placeholder="Razão social"
                      />
                      {informativo && (
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
                  <td
                    className={`py-1 pr-2 text-right tabular-nums ${informativo ? "text-accent-warm/80 italic" : ""}`}
                  >
                    {informativo ? `(${brl(ibs)})` : brl(ibs)}
                  </td>
                  <td
                    className={`py-1 pr-2 text-right tabular-nums ${informativo ? "text-accent-warm/80 italic" : ""}`}
                  >
                    {informativo ? `(${brl(cbs)})` : brl(cbs)}
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

      {fornecedor && (
        <p className="mt-2 text-[11px] text-muted-foreground">
          Valores entre parênteses são o crédito que existiria caso o fornecedor estivesse no regime normal — não
          entram no total de créditos.
        </p>
      )}

      <h3 className="mt-8 font-display text-xs font-semibold uppercase tracking-widest text-ink/60">
        Consolidado por regime
      </h3>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[520px] text-sm">
          <thead>
            <tr className="border-b border-line text-[11px] uppercase tracking-widest text-muted-foreground">
              <th className="py-2 text-left font-medium">Regime</th>
              <th className="py-2 text-right font-medium">%</th>
              <th className="py-2 text-right font-medium">Valor</th>
              <th className="py-2 text-right font-medium">IBS 18,70%</th>
              <th className="py-2 text-right font-medium">CBS 9,21%</th>
              <th className="py-2 text-right font-medium">{rotulo} total</th>
            </tr>
          </thead>
          <tbody>
            {resumo.linhas.map((l) => {
              const informativo = fornecedor && !l.geraCredito;
              const classe = informativo ? "text-accent-warm/80 italic" : "";
              return (
                <tr key={l.regime} className="border-b border-line/70">
                  <td className="py-2">
                    <span className="flex items-center gap-2">
                      <span className="size-2.5 rounded-full" style={{ backgroundColor: CORES_REGIME[l.regime] }} />
                      <span className={informativo ? "font-semibold text-accent-warm" : ""}>{l.regime}</span>
                    </span>
                  </td>
                  <td className="py-2 text-right tabular-nums">{pct(l.participacao)}</td>
                  <td className="py-2 text-right tabular-nums">{brl(l.valor)}</td>
                  <td className={`py-2 text-right tabular-nums ${classe}`}>
                    {informativo ? `(${brl(l.ibsPotencial)})` : brl(l.ibsPotencial)}
                  </td>
                  <td className={`py-2 text-right tabular-nums ${classe}`}>
                    {informativo ? `(${brl(l.cbsPotencial)})` : brl(l.cbsPotencial)}
                  </td>
                  <td className={`py-2 text-right tabular-nums font-medium ${classe}`}>
                    {informativo
                      ? `(${brl(l.ibsPotencial + l.cbsPotencial)})`
                      : brl(l.ibsPotencial + l.cbsPotencial)}
                  </td>
                </tr>
              );
            })}
            <tr className="font-semibold">
              <td className="py-2">Total {fornecedor ? "aproveitável" : "geral"}</td>
              <td className="py-2 text-right tabular-nums">
                {fornecedor ? pct(resumo.total > 0 ? (resumo.total - resumo.totalSemCredito) / resumo.total : 0) : "100,0%"}
              </td>
              <td className="py-2 text-right tabular-nums">
                {brl(fornecedor ? resumo.total - resumo.totalSemCredito : resumo.total)}
              </td>
              <td className="py-2 text-right tabular-nums">
                {brl(fornecedor ? resumo.totalIbs : resumo.totalIbsPotencial)}
              </td>
              <td className="py-2 text-right tabular-nums">
                {brl(fornecedor ? resumo.totalCbs : resumo.totalCbsPotencial)}
              </td>
              <td className="py-2 text-right tabular-nums">
                {brl(
                  fornecedor
                    ? resumo.totalIbs + resumo.totalCbs
                    : resumo.totalIbsPotencial + resumo.totalCbsPotencial,
                )}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl bg-gradient-to-br from-brand to-ink p-5 text-primary-foreground">
          <p className="text-xs opacity-75">{rotulo} · IBS 18,70%</p>
          <p className="mt-2 font-display text-2xl font-semibold leading-none">
            {brl(fornecedor ? resumo.totalIbs : resumo.totalIbsPotencial)}
          </p>
        </div>
        <div className="rounded-xl bg-gradient-to-br from-ink to-brand p-5 text-primary-foreground">
          <p className="text-xs opacity-75">{rotulo} · CBS 9,21%</p>
          <p className="mt-2 font-display text-2xl font-semibold leading-none">
            {brl(fornecedor ? resumo.totalCbs : resumo.totalCbsPotencial)}
          </p>
        </div>
        {fornecedor ? (
          <div className="rounded-xl bg-accent-warm/10 p-5 ring-1 ring-accent-warm/30">
            <p className="text-xs text-accent-warm">Crédito perdido · Simples / MEI / PF</p>
            <p className="mt-2 font-display text-2xl font-semibold leading-none text-accent-warm">
              {brl(resumo.totalSemCredito * (ALIQUOTA_IBS + ALIQUOTA_CBS))}
            </p>
            <p className="mt-1 text-[11px] text-ink/60">Não somado ao total de créditos.</p>
          </div>
        ) : (
          <div className="rounded-xl bg-frost p-5 ring-1 ring-line">
            <p className="text-xs text-muted-foreground">Débito total sobre as vendas</p>
            <p className="mt-2 font-display text-2xl font-semibold leading-none text-brand">
              {brl(resumo.totalIbsPotencial + resumo.totalCbsPotencial)}
            </p>
            <p className="mt-1 text-[11px] text-muted-foreground">100% do faturamento apresentado.</p>
          </div>
        )}
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
                {brl(resumo.totalSemCredito)}) vêm de fornecedores do Simples Nacional, MEI ou pessoa física. O crédito
                equivalente seria de{" "}
                <span className="font-semibold">{brl(resumo.totalSemCredito * (ALIQUOTA_IBS + ALIQUOTA_CBS))}</span>,
                mas <span className="font-semibold">não será aproveitado</span> — por isso não entra no total.
                Recomenda-se abordar esses fornecedores sobre migração de regime ou renegociação de preço.
              </>
            ) : (
              <>
                <span className="font-semibold">Atenção:</span> o débito de IBS/CBS incide sobre{" "}
                <span className="font-semibold">100% das vendas</span> apresentadas ({brl(resumo.total)}), totalizando{" "}
                <span className="font-semibold">{brl(resumo.totalIbsPotencial + resumo.totalCbsPotencial)}</span>. Os
                clientes de regime normal aproveitam esse valor como crédito; os do Simples Nacional, MEI e pessoa
                física ({pct(resumo.total > 0 ? resumo.totalSemCredito / resumo.total : 0)} do faturamento) não
                aproveitam, o que exige atenção na formação de preço.
              </>
            )}
          </p>
        </div>
      )}
    </Painel>
  );
}
