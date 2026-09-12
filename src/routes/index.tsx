import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SecaoImportacao } from "@/components/estudo/SecaoImportacao";
import { SecaoCadastro, SecaoCnaes } from "@/components/estudo/SecaoCadastro";
import { SecaoFaturamento } from "@/components/estudo/SecaoFaturamento";
import { SecaoParceiros } from "@/components/estudo/SecaoParceiros";
import { SecaoSimulacoes } from "@/components/estudo/SecaoSimulacoes";
import { SecaoDiagnostico } from "@/components/estudo/SecaoDiagnostico";
import { DocumentoDiagnostico } from "@/components/estudo/DocumentoDiagnostico";
import { CampoTexto } from "@/components/estudo/campos";
import logoLogica from "@/assets/logica-na-reforma.jpg.asset.json";
import { estudoVazio } from "@/lib/estudo";

import { useEstudo } from "@/lib/useEstudo";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Estudo do Simples Nacional Híbrido — Reforma Tributária 2027" },
      {
        name: "description",
        content:
          "Sistema de apresentação contábil: consulta cadastral, CNAEs e anexos, faturamento, CBS por regime de fornecedores e clientes e simulações tributárias para 2027.",
      },
      { property: "og:title", content: "Estudo do Simples Nacional Híbrido — Reforma Tributária 2027" },
      {
        property: "og:description",
        content:
          "Estudo interativo para escritórios de contabilidade apresentarem ao cliente o comparativo de regimes sob a Reforma Tributária de 2027.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const ETAPAS = [
  { id: "importacao", numero: "00", nome: "Importar" },
  { id: "cadastro", numero: "01", nome: "Cadastral" },
  { id: "cnaes", numero: "02", nome: "CNAEs" },
  { id: "faturamento", numero: "03", nome: "Faturamento" },
  { id: "regimes", numero: "04", nome: "Regimes" },
  { id: "simulacao", numero: "05", nome: "Simulação" },
  { id: "diagnostico", numero: "06", nome: "Diagnóstico" },
];

function Index() {
  const { estudo, setEstudo, atualizar } = useEstudo();
  const [etapa, setEtapa] = useState("importacao");
  const [documentoAberto, setDocumentoAberto] = useState(false);

  const irPara = (id: string) => {
    setEtapa(id);
    if (id === "importacao") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    window.requestAnimationFrame(() =>
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" }),
    );
  };

  if (documentoAberto) {
    return (
      <div className="min-h-screen w-full bg-mist py-8">
        <div className="no-print sticky top-0 z-10 mx-auto mb-6 flex max-w-[210mm] items-center justify-between gap-3 rounded-full bg-white/90 px-5 py-3 shadow-sm ring-1 ring-line backdrop-blur">
          <p className="font-display text-sm font-semibold">Diagnóstico — pré-visualização</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setDocumentoAberto(false)}
              className="rounded-full px-4 py-2 text-sm font-medium text-ink/70 ring-1 ring-line transition-colors hover:bg-frost"
            >
              Voltar ao estudo
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="rounded-full bg-ink px-5 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              Salvar em PDF
            </button>
          </div>
        </div>
        <DocumentoDiagnostico estudo={estudo} />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-mist font-body text-ink antialiased">
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute -left-32 -top-40 size-[520px] rotate-12 rounded-full bg-brand/10 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 top-1/3 size-[420px] -rotate-6 rounded-full bg-accent-warm/10 blur-3xl" />

        <header className="relative mx-auto max-w-7xl px-6 pb-8 pt-10">
          <div className="flex items-center justify-between text-xs font-medium uppercase tracking-[0.2em] text-brand">
            <span />
            <span className="hidden sm:inline">Confidencial — Estudo para o cliente</span>
          </div>

          <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-[52ch]">
              <img
                src={logoLogica.url}
                alt="Lógica na Reforma — da contabilidade à estratégia"
                className="mb-5 h-28 w-auto mix-blend-multiply lg:h-40"
              />
              <h1 className="text-balance font-display text-4xl font-semibold leading-none tracking-tighter lg:text-5xl">
                Estudo do <span className="text-brand">Simples Nacional Híbrido</span>
              </h1>
              <p className="mt-4 text-pretty text-base text-ink/70">
                 Comparativo de regimes sob a Reforma Tributária, com foco na CBS de 9,21% — cenário projetado para 2027.
              </p>
            </div>

            <div className="no-print flex items-center gap-3">
              <div className="text-right">
                <p className="text-[11px] uppercase tracking-[0.15em] text-ink/50">Cenário</p>
                <p className="font-display text-2xl font-semibold leading-none">2027</p>
              </div>
              <button
                type="button"
                onClick={() => setEstudo({ ...estudoVazio, escritorio: estudo.escritorio })}
                className="rounded-full px-4 py-2.5 text-sm font-medium text-ink/70 ring-1 ring-line transition-colors hover:bg-white/70"
              >
                Novo estudo
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-primary-foreground ring-1 ring-ink/40 transition-opacity hover:opacity-90"
              >
                Exportar PDF
              </button>
            </div>
          </div>

          <nav className="no-print mt-8 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
            {ETAPAS.map((e) => (
              <button
                key={e.id}
                type="button"
                onClick={() => irPara(e.id)}
                className={`rounded-xl px-4 py-3 text-left transition-colors ${
                  etapa === e.id ? "bg-ink text-primary-foreground" : "bg-white/60 ring-1 ring-line hover:bg-white/80"
                }`}
              >
                <span
                  className={`font-display text-lg font-semibold ${etapa === e.id ? "" : "text-brand"}`}
                >
                  {e.numero}
                </span>
                <p className={`text-xs ${etapa === e.id ? "opacity-75" : "text-ink/60"}`}>{e.nome}</p>
              </button>
            ))}
          </nav>
        </header>

        <main className="relative mx-auto grid max-w-7xl gap-5 px-6 pb-16">
          {etapa === "importacao" ? (
            <SecaoImportacao
              estudo={estudo}
              onImportado={(novo) => setEstudo(novo)}
              onAbrirEstudo={() => irPara("cadastro")}
            />
          ) : (
          <>
          <div id="cadastro" className="min-w-0 scroll-mt-6">
            <SecaoCadastro cadastro={estudo.cadastro} onChange={(cadastro) => atualizar({ cadastro })} />
          </div>
          <div id="cnaes" className="min-w-0 scroll-mt-6">
            <SecaoCnaes cnaes={estudo.cnaes} onChange={(cnaes) => atualizar({ cnaes })} />
          </div>
          <div id="faturamento" className="min-w-0 scroll-mt-6">
            <SecaoFaturamento valores={estudo.faturamento} onChange={(faturamento) => atualizar({ faturamento })} />
          </div>
          <div id="regimes" className="grid min-w-0 scroll-mt-6 gap-5">
            <SecaoParceiros
              numero="04a"
              tipo="fornecedores"
              itens={estudo.fornecedores}
              onChange={(fornecedores) => atualizar({ fornecedores })}
            />
            <SecaoParceiros
              numero="04b"
              tipo="clientes"
              itens={estudo.clientes}
              onChange={(clientes) => atualizar({ clientes })}
            />
          </div>
          <div id="simulacao" className="min-w-0 scroll-mt-6">
            <SecaoSimulacoes
              simulacoes={estudo.simulacoes}
              faturamento={estudo.faturamento}
              onChange={(simulacoes) => atualizar({ simulacoes })}
            />
          </div>

          <div id="diagnostico" className="min-w-0 scroll-mt-6">
            <SecaoDiagnostico
              diagnostico={estudo.diagnostico}
              onChange={(diagnostico) => atualizar({ diagnostico })}
              onGerar={() => {
                setDocumentoAberto(true);
                window.scrollTo({ top: 0 });
              }}
            />
          </div>

          <section className="painel clip-tilt p-6">
            <h2 className="font-display text-sm font-semibold uppercase tracking-widest text-brand">
              Observações do escritório
            </h2>
            <CampoTexto
              valor={estudo.observacoes}
              onChange={(v) => atualizar({ observacoes: v })}
              placeholder="Considerações, premissas e recomendações apresentadas ao cliente."
              multiline
              className="mt-3 min-h-24 text-sm"
            />
          </section>
          </>
          )}

        </main>
      </div>
    </div>
  );
}
