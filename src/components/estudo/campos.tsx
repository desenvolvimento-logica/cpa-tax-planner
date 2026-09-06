import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { REGIMES, type Regime } from "@/lib/estudo";

type TextoProps = {
  valor: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
  multiline?: boolean;
};

export function CampoTexto({ valor, onChange, placeholder, className, multiline }: TextoProps) {
  const base =
    "w-full rounded-md bg-transparent px-2 py-1 text-sm outline-none transition-colors placeholder:text-muted-foreground/60 hover:bg-frost focus:bg-white focus:ring-2 focus:ring-primary/40";
  if (multiline) {
    return (
      <textarea
        value={valor}
        rows={2}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={cn(base, "resize-y leading-snug", className)}
      />
    );
  }
  return (
    <input
      value={valor}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className={cn(base, className)}
    />
  );
}

type NumeroProps = {
  valor: number;
  onChange: (v: number) => void;
  className?: string;
  placeholder?: string;
};

export function CampoValor({ valor, onChange, className, placeholder }: NumeroProps) {
  const [texto, setTexto] = useState(() => formatar(valor));
  const [editando, setEditando] = useState(false);

  useEffect(() => {
    if (!editando) setTexto(formatar(valor));
  }, [valor, editando]);

  return (
    <input
      inputMode="decimal"
      value={texto}
      placeholder={placeholder ?? "0,00"}
      onFocus={() => setEditando(true)}
      onChange={(e) => {
        setTexto(e.target.value);
        onChange(interpretar(e.target.value));
      }}
      onBlur={() => {
        setEditando(false);
        setTexto(formatar(valor));
      }}
      className={cn(
        "w-full rounded-md bg-transparent px-2 py-1 text-right text-sm tabular-nums outline-none transition-colors hover:bg-frost focus:bg-white focus:ring-2 focus:ring-primary/40",
        className,
      )}
    />
  );
}

function formatar(v: number) {
  if (!v) return "";
  return v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function interpretar(t: string) {
  const limpo = t.replace(/[^\d,.-]/g, "").replace(/\./g, "").replace(",", ".");
  const n = Number(limpo);
  return Number.isFinite(n) ? n : 0;
}

export function SeletorRegime({
  valor,
  onChange,
}: {
  valor: Regime;
  onChange: (v: Regime) => void;
}) {
  return (
    <select
      value={valor}
      onChange={(e) => onChange(e.target.value as Regime)}
      className="w-full rounded-md bg-transparent px-2 py-1 text-sm outline-none transition-colors hover:bg-frost focus:bg-white focus:ring-2 focus:ring-primary/40"
    >
      {REGIMES.map((r) => (
        <option key={r} value={r}>
          {r}
        </option>
      ))}
    </select>
  );
}

export function Painel({
  numero,
  titulo,
  acessorio,
  children,
  className,
}: {
  numero?: string;
  titulo: string;
  acessorio?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("painel clip-tilt min-w-0 p-6", className)}>
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 className="font-display text-sm font-semibold uppercase tracking-widest text-brand">
          {numero ? `${numero} · ` : ""}
          {titulo}
        </h2>
        {acessorio}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

export function BotaoLinha({
  children,
  onClick,
  tom = "neutro",
}: {
  children: React.ReactNode;
  onClick: () => void;
  tom?: "neutro" | "perigo";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "no-print rounded-full px-3 py-1.5 text-xs font-medium ring-1 transition-colors",
        tom === "perigo"
          ? "text-destructive ring-destructive/30 hover:bg-destructive/10"
          : "text-brand ring-line hover:bg-frost",
      )}
    >
      {children}
    </button>
  );
}
