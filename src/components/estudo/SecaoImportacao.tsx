import { useRef, useState } from "react";
import { estudoVazio, type Estudo } from "@/lib/estudo";
import { importarArquivos, ROTULO_TIPO, type ResultadoArquivo } from "@/lib/importarPdf";
import type { EstudoSalvo } from "@/lib/useEstudo";

type Props = {
  estudo: Estudo;
  onImportado: (estudo: Estudo) => void;
  onAbrirEstudo: () => void;
  historico: EstudoSalvo[];
  onAbrirSalvo: (id: string) => void;
  onExcluirSalvo: (id: string) => void;
};

const ESPERADOS = [
  "Declaração de faturamento (consulta automática do CNPJ e dos CNAEs)",
  "Resumo Mensal da folha (Base total da seção INSS)",
  "Perfil tributário de clientes e fornecedores (PDF ou planilha Excel)",
  "Comparativo de regimes tributários — Memória de Cálculo",
  "Consultas de CNAE (o que compreende e não compreende)",
];

export function SecaoImportacao({ estudo, onImportado, onAbrirEstudo, historico, onAbrirSalvo, onExcluirSalvo }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [substituir, setSubstituir] = useState(true);
  const [processando, setProcessando] = useState(false);
  const [arrastando, setArrastando] = useState(false);
  const [resultados, setResultados] = useState<ResultadoArquivo[]>([]);

  const processar = async (lista: FileList | null) => {
    if (!lista?.length) return;
    const arquivos = Array.from(lista).filter((f) => /\.(pdf|xlsx|xlsm|xls|csv)$/i.test(f.name));
    if (!arquivos.length) return;
    setProcessando(true);
    try {
      const base: Estudo = substituir
        ? { ...estudoVazio, escritorio: estudo.escritorio, diagnostico: estudo.diagnostico }
        : estudo;
      // CNPJ primeiro (cria os CNAEs), depois os demais relatórios.
      const ordenados = [...arquivos].sort((a, b) => Number(b.name.toUpperCase().includes("CNPJ")) - Number(a.name.toUpperCase().includes("CNPJ")));
      const { estudo: novo, resultados: res } = await importarArquivos(ordenados, base);
      onImportado(novo);
      setResultados(res);
    } finally {
      setProcessando(false);
    }
  };

  const lidos = resultados.filter((r) => r.ok).length;

  return (
    <section className="painel p-6 sm:p-8">
      <p className="font-display text-sm font-semibold uppercase tracking-widest text-brand">Etapa 00 · Importação</p>
      <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight">Importe os relatórios do cliente</h2>
      <p className="mt-2 max-w-[70ch] text-sm text-ink/70">
        Envie os relatórios em PDF gerados para este cliente. Pela declaração de faturamento, o sistema consulta o CNPJ
        e completa automaticamente os dados cadastrais e CNAEs. O Resumo Mensal preenche a folha e a Memória de
        Cálculo atualiza os quatro regimes tributários.
      </p>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setArrastando(true);
        }}
        onDragLeave={() => setArrastando(false)}
        onDrop={(e) => {
          e.preventDefault();
          setArrastando(false);
          void processar(e.dataTransfer.files);
        }}
        className={`mt-6 rounded-2xl border-2 border-dashed p-8 text-center transition-colors ${
          arrastando ? "border-brand bg-brand/5" : "border-line bg-white/60"
        }`}
      >
        <p className="font-display text-lg font-semibold">Arraste os PDFs e planilhas aqui</p>
        <p className="mt-1 text-sm text-ink/60">ou selecione os arquivos no seu computador</p>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.xlsx,.xlsm,.xls,.csv,application/pdf,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          multiple
          className="hidden"
          onChange={(e) => void processar(e.target.files)}
        />
        <button
          type="button"
          disabled={processando}
          onClick={() => inputRef.current?.click()}
          className="mt-4 rounded-full bg-ink px-6 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {processando ? "Lendo relatórios…" : "Selecionar relatórios"}
        </button>

        <label className="mt-5 flex items-center justify-center gap-2 text-sm text-ink/70">
          <input
            type="checkbox"
            checked={substituir}
            onChange={(e) => setSubstituir(e.target.checked)}
            className="size-4 accent-current"
          />
          Substituir os dados atuais (novo cliente)
        </label>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <div className="rounded-2xl bg-frost/60 p-5 ring-1 ring-line">
          <h3 className="font-display text-sm font-semibold uppercase tracking-widest text-brand">
            Relatórios aceitos
          </h3>
          <ul className="mt-3 space-y-1.5 text-sm text-ink/75">
            {ESPERADOS.map((e) => (
              <li key={e} className="flex gap-2">
                <span className="mt-2 inline-block size-1.5 shrink-0 bg-accent-warm" />
                {e}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl bg-white/70 p-5 ring-1 ring-line">
          <h3 className="font-display text-sm font-semibold uppercase tracking-widest text-brand">
            Arquivos lidos {resultados.length ? `(${lidos}/${resultados.length})` : ""}
          </h3>
          {resultados.length === 0 ? (
            <p className="mt-3 text-sm text-ink/55">Nenhum relatório importado nesta sessão.</p>
          ) : (
            <ul className="mt-3 space-y-2 text-sm">
              {resultados.map((r) => (
                <li key={r.nome} className="rounded-xl bg-mist/70 px-3 py-2">
                  <p className="flex items-center gap-2 font-medium">
                    <span
                      className={`inline-block size-2 rounded-full ${r.ok ? "bg-brand" : "bg-accent-warm"}`}
                      aria-hidden
                    />
                    <span className="truncate">{r.nome}</span>
                  </p>
                  <p className="mt-0.5 text-xs text-ink/60">
                    {ROTULO_TIPO[r.tipo]} — {r.resumo}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onAbrirEstudo}
          className="rounded-full bg-brand px-6 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          Abrir o estudo
        </button>
        <p className="text-xs text-ink/55">
          Você também pode abrir o estudo e ajustar qualquer informação manualmente.
        </p>
      </div>

      <div className="mt-8 border-t border-line pt-6">
        <h3 className="font-display text-sm font-semibold uppercase tracking-widest text-brand">Estudos salvos</h3>
        {historico.length === 0 ? (
          <p className="mt-3 text-sm text-ink/55">Os estudos realizados aparecerão aqui para consulta posterior.</p>
        ) : (
          <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {historico.map((item) => (
              <article key={item.id} className="rounded-md bg-white/70 p-4 ring-1 ring-line">
                <p className="font-display font-semibold">{item.nome}</p>
                <p className="mt-1 text-xs text-ink/60">{item.cnpj || "CNPJ não informado"}</p>
                <p className="mt-1 text-xs text-ink/50">
                  Atualizado em {new Date(item.atualizadoEm).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}
                </p>
                <div className="mt-4 flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onAbrirSalvo(item.id);
                      onAbrirEstudo();
                    }}
                    className="rounded-full bg-brand px-4 py-2 text-xs font-medium text-primary-foreground"
                  >
                    Abrir estudo
                  </button>
                  <button
                    type="button"
                    onClick={() => onExcluirSalvo(item.id)}
                    className="rounded-full px-4 py-2 text-xs font-medium text-destructive ring-1 ring-destructive/30"
                  >
                    Excluir
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
