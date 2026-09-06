import { CampoTexto, Painel } from "@/components/estudo/campos";
import type { Diagnostico } from "@/lib/estudo";

type Props = {
  diagnostico: Diagnostico;
  onChange: (d: Diagnostico) => void;
  onGerar: () => void;
};

function Campo({
  rotulo,
  valor,
  onChange,
  multiline,
  linhas,
}: {
  rotulo: string;
  valor: string;
  onChange: (v: string) => void;
  multiline?: boolean;
  linhas?: string;
}) {
  return (
    <label className="block">
      <span className="text-[11px] uppercase tracking-[0.15em] text-ink/50">{rotulo}</span>
      <CampoTexto
        valor={valor}
        onChange={onChange}
        multiline={multiline ?? false}
        className={multiline ? `mt-1 ${linhas ?? "min-h-28"} text-sm` : "mt-1 text-sm"}
      />
    </label>
  );
}

export function SecaoDiagnostico({ diagnostico, onChange, onGerar }: Props) {
  const set = (patch: Partial<Diagnostico>) => onChange({ ...diagnostico, ...patch });

  return (
    <Painel
      numero="06"
      titulo="Diagnóstico para o cliente"
      acessorio={
        <button
          type="button"
          onClick={onGerar}
          className="no-print rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          Gerar documento
        </button>
      }
    >
      <p className="max-w-[70ch] text-sm text-ink/70">
        O documento segue a capa e o padrão institucional do escritório: capa, introdução sobre a reforma e o Simples
        Híbrido, a análise das atividades (CNAE), a análise de clientes e fornecedores, as simulações tributárias e os próximos passos.
        Ajuste os textos abaixo e clique em <strong>Gerar documento</strong> para visualizar e salvar em PDF.
      </p>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <Campo rotulo="Chamada da capa" valor={diagnostico.tituloCapa} onChange={(v) => set({ tituloCapa: v })} />
        <Campo rotulo="Ano-base" valor={diagnostico.anoBase} onChange={(v) => set({ anoBase: v })} />
        <Campo rotulo="Emitido em" valor={diagnostico.emitidoEm} onChange={(v) => set({ emitidoEm: v })} />
        <Campo rotulo="Subtítulo da capa" valor={diagnostico.chamadaCapa} onChange={(v) => set({ chamadaCapa: v })} />
        <Campo rotulo="Telefone" valor={diagnostico.telefone} onChange={(v) => set({ telefone: v })} />
        <Campo rotulo="E-mail" valor={diagnostico.email} onChange={(v) => set({ email: v })} />
        <Campo rotulo="Site" valor={diagnostico.site} onChange={(v) => set({ site: v })} />
        <div className="md:col-span-2">
          <Campo rotulo="Endereço" valor={diagnostico.endereco} onChange={(v) => set({ endereco: v })} />
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Campo rotulo="Saudação" valor={diagnostico.saudacao} onChange={(v) => set({ saudacao: v })} />
        <Campo
          rotulo="Confidencialidade"
          valor={diagnostico.confidencial}
          onChange={(v) => set({ confidencial: v })}
        />
        <Campo rotulo="Introdução" valor={diagnostico.introducao} onChange={(v) => set({ introducao: v })} multiline />
        <Campo
          rotulo="O que muda com a reforma"
          valor={diagnostico.oQueMuda}
          onChange={(v) => set({ oQueMuda: v })}
          multiline
        />
        <Campo rotulo="Prazos" valor={diagnostico.prazos} onChange={(v) => set({ prazos: v })} multiline />
        <div className="lg:col-span-2">
          <Campo
            rotulo="Próximos passos — preencher conforme o cliente (um por linha)"
            valor={diagnostico.proximosPassos}
            onChange={(v) => set({ proximosPassos: v })}
            multiline
          />
        </div>
        <div className="lg:col-span-2">
          <Campo
            rotulo="Frase de encerramento"
            valor={diagnostico.encerramento}
            onChange={(v) => set({ encerramento: v })}
            multiline
            linhas="min-h-16"
          />
        </div>
      </div>
    </Painel>
  );
}
