import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/app-client";
import { SecaoImportacao } from "@/components/estudo/SecaoImportacao";
import { SecaoCadastro, SecaoCnaes } from "@/components/estudo/SecaoCadastro";
import { SecaoFaturamento } from "@/components/estudo/SecaoFaturamento";
import { SecaoFolha } from "@/components/estudo/SecaoFolha";
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
          "Sistema contábil com cadastro, CNAEs, faturamento, folha, CBS por regime e comparação tributária para 2027.",
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
  { id: "folha", numero: "04", nome: "Folha" },
  { id: "regimes", numero: "05", nome: "Regimes" },
  { id: "simulacao", numero: "06", nome: "Simulação" },
  { id: "diagnostico", numero: "07", nome: "Diagnóstico" },
];

const HUB_URL = "https://hub-logica.vercel.app";

// Acesso liberado somente pelo portal Luz.IA.
const GATE_LUZIA_ATIVO = false;

function Index() {
  const [estado, setEstado] = useState<"carregando" | "autorizado" | "negado">(
    GATE_LUZIA_ATIVO ? "carregando" : "autorizado",
  );

  useEffect(() => {
    if (!GATE_LUZIA_ATIVO) return;
    let ativo = true;

    const { data: sub } = supabase.auth.onAuthStateChange((_evento, sessao) => {
      if (ativo && sessao) setEstado("autorizado");
    });

    supabase.auth.getSession().then(({ data }) => {
      if (ativo && data.session) setEstado("autorizado");
    });

    const timer = window.setTimeout(() => {
      if (ativo) setEstado((atual) => (atual === "autorizado" ? atual : "negado"));
    }, 2500);

    return () => {
      ativo = false;
      window.clearTimeout(timer);
      sub.subscription.unsubscribe();
    };
  }, []);

  if (estado === "carregando") {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-mist font-body text-ink">
        <div className="text-center">
          <div className="mx-auto size-8 animate-spin rounded-full border-2 border-line border-t-brand" />
          <p className="mt-4 text-sm text-ink/60">Conectando ao portal Luz.IA…</p>
        </div>
      </div>
    );
  }

  if (estado === "negado") {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-mist px-6 font-body text-ink">
        <div className="max-w-md rounded-2xl bg-white/80 p-8 text-center ring-1 ring-line">
          <h1 className="font-display text-xl font-semibold">Acesso não autorizado</h1>
          <p className="mt-3 text-sm text-ink/70">Abra esta ferramenta pelo portal Luz.IA.</p>
          <a
            href={HUB_URL}
            className="mt-6 inline-block rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            Ir para o portal Luz.IA
          </a>
        </div>
      </div>
    );
  }

  return <EstudoApp />;
}

function EstudoApp() {
  const { estudo, setEstudo, atualizar, historico, salvarEstudo, abrirEstudo, excluirEstudo } = useEstudo();
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
      <div className="min-h-screen w-full bg-mist py-8 print:bg-white print:py-0">
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
          <div className="text-center text-[10px] font-medium uppercase leading-relaxed tracking-[0.16em] text-brand sm:text-xs sm:tracking-[0.2em]">
            Confidencial — Estudo para o cliente · Análise baseada nos dados fiscais da empresa referentes a 2026
          </div>

          <div className="mt-6 flex flex-col items-center gap-6">
            <div className="w-full text-center">
              <img
                src={logoLogica.url}
                alt="Lógica na Reforma — da contabilidade à estratégia"
                className="mx-auto mb-5 h-28 w-auto mix-blend-multiply lg:h-40"
              />
              <h1 className="whitespace-nowrap font-display text-lg font-semibold leading-none sm:text-2xl lg:text-4xl">
                Estudo do <span className="text-brand">Simples Nacional Híbrido</span>
              </h1>
              <p className="mt-4 text-pretty text-base text-ink/70">
                 Comparativo de regimes sob a Reforma Tributária, com foco na CBS de 9,21% — cenário projetado para 2027.
              </p>
            </div>

            <div className="no-print flex flex-wrap items-center justify-center gap-3">
              <div className="text-right">
                <p className="text-[11px] uppercase tracking-[0.15em] text-ink/50">Cenário</p>
                <p className="font-display text-2xl font-semibold leading-none">2027</p>
              </div>
              <button
                type="button"
                onClick={async () => {
                  if (estudo.cadastro.cnpj) await salvarEstudo();
                  setEstudo({ ...estudoVazio, escritorio: estudo.escritorio });
                  setEtapa("importacao");
                }}
                className="rounded-full px-4 py-2.5 text-sm font-medium text-ink/70 ring-1 ring-line transition-colors hover:bg-white/70"
              >
                Novo estudo
              </button>
              <button
                type="button"
                onClick={() => salvarEstudo()}
                className="rounded-full px-4 py-2.5 text-sm font-medium text-brand ring-1 ring-brand/30 transition-colors hover:bg-white/70"
              >
                Salvar estudo
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

          <nav className="no-print mt-8 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-8">
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
              historico={historico}
              onAbrirSalvo={abrirEstudo}
              onExcluirSalvo={excluirEstudo}
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
            <SecaoFaturamento
              valores={estudo.faturamento}
              tributacoes={estudo.tributacoesNacionais}
              onChange={(faturamento) => atualizar({ faturamento })}
              onChangeTributacoes={(tributacoesNacionais) => atualizar({ tributacoesNacionais })}
            />
          </div>
          <div id="folha" className="min-w-0 scroll-mt-6">
            <SecaoFolha valores={estudo.folha} onChange={(folha) => atualizar({ folha })} />
          </div>
          <div id="regimes" className="grid min-w-0 scroll-mt-6 gap-5">
            <SecaoParceiros
              numero="05a"
              tipo="fornecedores"
              itens={estudo.fornecedores}
              onChange={(fornecedores) => atualizar({ fornecedores })}
            />
            <SecaoParceiros
              numero="05b"
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
