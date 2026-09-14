import type { Cadastro, CnaeItem } from "@/lib/estudo";
import { BotaoLinha, CampoTexto, Painel } from "./campos";

const CAMPOS: { chave: keyof Cadastro; rotulo: string; placeholder: string }[] = [
  { chave: "razaoSocial", rotulo: "Razão social", placeholder: "Nome empresarial" },
  { chave: "nomeFantasia", rotulo: "Nome fantasia", placeholder: "Nome fantasia" },
  { chave: "cnpj", rotulo: "CNPJ", placeholder: "00.000.000/0001-00" },
  { chave: "abertura", rotulo: "Data de abertura", placeholder: "dd/mm/aaaa" },
  { chave: "naturezaJuridica", rotulo: "Natureza jurídica", placeholder: "206-2 — LTDA" },
  { chave: "capitalSocial", rotulo: "Capital social", placeholder: "R$ 0,00" },
  { chave: "situacao", rotulo: "Situação cadastral", placeholder: "Ativa" },
  { chave: "regimeAtual", rotulo: "Regime atual", placeholder: "Simples Nacional" },
  { chave: "endereco", rotulo: "Endereço", placeholder: "Logradouro, número, cidade/UF" },
];

export function SecaoCadastro({
  cadastro,
  onChange,
}: {
  cadastro: Cadastro;
  onChange: (c: Cadastro) => void;
}) {
  return (
    <Painel
      numero="01"
      titulo="Dados cadastrais"
      acessorio={<span className="text-[11px] uppercase tracking-widest text-muted-foreground">Conforme consulta CNPJ</span>}
    >
      <dl className="grid gap-x-8 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
        {CAMPOS.map((c) => (
          <div key={c.chave} className="border-b border-line/70 py-1">
            <dt className="px-2 text-[11px] uppercase tracking-widest text-muted-foreground">{c.rotulo}</dt>
            <dd>
              <CampoTexto
                valor={cadastro[c.chave]}
                placeholder={c.placeholder}
                onChange={(v) => onChange({ ...cadastro, [c.chave]: v })}
                className="font-medium"
              />
            </dd>
          </div>
        ))}
      </dl>
    </Painel>
  );
}

export function SecaoCnaes({
  cnaes,
  onChange,
}: {
  cnaes: CnaeItem[];
  onChange: (c: CnaeItem[]) => void;
}) {
  const atualizar = (id: string, patch: Partial<CnaeItem>) =>
    onChange(cnaes.map((c) => (c.id === id ? { ...c, ...patch } : c)));

  return (
    <Painel
      numero="02"
      titulo="Atividades (CNAE) e anexos do Simples"
      acessorio={
        <BotaoLinha
          onClick={() =>
            onChange([
              ...cnaes,
              { id: crypto.randomUUID(), codigo: "", descricao: "", compreende: "", naoCompreende: "", anexo: "" },
            ])
          }
        >
          + Adicionar CNAE
        </BotaoLinha>
      }
    >
      <div className="grid gap-4 lg:grid-cols-2">
        {cnaes.map((c) => (
          <article key={c.id} className="rounded-md bg-frost p-4 ring-1 ring-line">
            <div className="flex items-start gap-2">
              <CampoTexto
                valor={c.codigo}
                onChange={(v) => atualizar(c.id, { codigo: v })}
                placeholder="0000-0/00"
                className="w-32 font-display font-semibold"
              />
              <button
                type="button"
                aria-label="Remover CNAE"
                onClick={() => onChange(cnaes.filter((x) => x.id !== c.id))}
                className="no-print ml-auto rounded-full px-2 text-muted-foreground transition-colors hover:text-destructive"
              >
                ×
              </button>
            </div>
            <CampoTexto
              valor={c.anexo}
              onChange={(v) => atualizar(c.id, { anexo: v })}
              placeholder="Anexo V — sujeito ao Fator R"
              multiline
              className="mt-2 min-h-8 rounded bg-brand/10 text-center text-xs font-semibold leading-relaxed text-brand"
            />
            <CampoTexto
              valor={c.descricao}
              onChange={(v) => atualizar(c.id, { descricao: v })}
              placeholder="Descrição oficial da atividade"
              multiline
              className="mt-2 text-sm font-medium"
            />
            <p className="mt-3 px-2 text-[11px] uppercase tracking-widest text-brand">Compreende</p>
            <CampoTexto
              valor={c.compreende}
              onChange={(v) => atualizar(c.id, { compreende: v })}
              placeholder="O que esta atividade abrange"
              multiline
              className="min-h-10 text-xs leading-relaxed"
            />
            <p className="mt-2 px-2 text-[11px] uppercase tracking-widest text-accent-warm">Não compreende</p>
            <CampoTexto
              valor={c.naoCompreende}
              onChange={(v) => atualizar(c.id, { naoCompreende: v })}
              placeholder="O que fica de fora desta atividade"
              multiline
              className="min-h-10 text-xs leading-relaxed"
            />
          </article>
        ))}
      </div>
    </Painel>
  );
}
