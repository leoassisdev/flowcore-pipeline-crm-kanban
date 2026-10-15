// DashPipeline · Criado por FlowCore Soluções LTDA · flowcoresolucoes.com.br/codigos · licença MIT
// Funil de vendas (CRM) em kanban: arraste negócios entre etapas (ou use os
// botões de mover, acessíveis por teclado), com total por coluna e previsão ponderada.
// Pra usar dados reais, troque o array DADOS pela resposta da sua API e salve em onMove.
// Props: accent (cor de destaque), negocios (lista inicial), onMove (avisa cada
// movimentação), tema ("claro" | "escuro", padrão "claro") e onTemaChange (avisa
// quando o botão sol/lua troca).
// Requisitos: React 18+ e Tailwind CSS 3+. Zero dependências.

import { useState, type CSSProperties, type DragEvent } from "react";

type Tema = "claro" | "escuro";
type Etapa = "lead" | "qualificado" | "proposta" | "negociacao" | "fechado";
type Negocio = { id: string; empresa: string; contato: string; valor: number; etapa: Etapa; dias: number; responsavel: string };

// Paleta de cada tema, aplicada como CSS vars na raiz (não depende do dark: do Tailwind).
const TEMAS: Record<Tema, Record<string, string>> = {
  claro: {
    "--fc-bg": "#F7F8FB", "--fc-surface": "#FFFFFF", "--fc-surface-2": "#F1F4F9",
    "--fc-border": "#E3E8F0", "--fc-border-strong": "#CBD3E1",
    "--fc-text": "#0B1220", "--fc-muted": "#4B5565", "--fc-subtle": "#8A94A6",
    "--fc-pos": "#059669", "--fc-neg": "#E11D48", "--fc-warn": "#D97706",
    "--fc-shadow": "0 1px 2px rgba(16,24,40,.06), 0 12px 32px -16px rgba(16,24,40,.18)",
    "--fc-pop": "#FFFFFF", "--fc-grid": "#EDF0F5",
  },
  escuro: {
    "--fc-bg": "#0B0F17", "--fc-surface": "rgba(255,255,255,0.03)", "--fc-surface-2": "rgba(255,255,255,0.06)",
    "--fc-border": "rgba(255,255,255,0.10)", "--fc-border-strong": "rgba(255,255,255,0.25)",
    "--fc-text": "#FFFFFF", "--fc-muted": "rgba(255,255,255,0.60)", "--fc-subtle": "rgba(255,255,255,0.40)",
    "--fc-pos": "#34D399", "--fc-neg": "#FB7185", "--fc-warn": "#FBBF24",
    "--fc-shadow": "0 24px 48px -24px rgba(0,0,0,.6)",
    "--fc-pop": "#111827", "--fc-grid": "rgba(255,255,255,0.06)",
  },
};
const PALETA = ["var(--accent)", "#7C3AED", "#10B981", "#F59E0B", "#EC4899", "#06B6D4"];
const tinta = (cor: string, pct: number) => `color-mix(in srgb, ${cor} ${pct}%, transparent)`;

// Tema controlado pela prop, mas o botão sol/lua troca por dentro.
function useTema(inicial: Tema, onTemaChange?: (t: Tema) => void) {
  const [tema, setTema] = useState<Tema>(inicial);
  const [prop, setProp] = useState<Tema>(inicial);
  if (prop !== inicial) {
    setProp(inicial);
    setTema(inicial);
  }
  const alternar = () => {
    const novo: Tema = tema === "claro" ? "escuro" : "claro";
    setTema(novo);
    onTemaChange?.(novo);
  };
  return [tema, alternar] as const;
}

function BotaoTema({ tema, onClick }: { tema: Tema; onClick: () => void }) {
  const escuro = tema === "escuro";
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={escuro ? "Ativar modo claro" : "Ativar modo escuro"}
      title={escuro ? "Modo claro" : "Modo escuro"}
      className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-[var(--fc-border)] bg-[var(--fc-surface)] text-[var(--fc-muted)] transition-colors hover:bg-[var(--fc-surface-2)] hover:text-[var(--fc-text)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        {escuro ? (
          <>
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
          </>
        ) : (
          <path d="M20 14.5A8 8 0 019.5 4a8 8 0 1010.5 10.5z" />
        )}
      </svg>
    </button>
  );
}

const ETAPAS: { id: Etapa; nome: string; prob: number }[] = [
  { id: "lead", nome: "Lead", prob: 0.1 },
  { id: "qualificado", nome: "Qualificado", prob: 0.25 },
  { id: "proposta", nome: "Proposta", prob: 0.5 },
  { id: "negociacao", nome: "Negociação", prob: 0.75 },
  { id: "fechado", nome: "Fechado", prob: 1 },
];

const DADOS: Negocio[] = [
  { id: "n1", empresa: "Grupo Sena Logística", contato: "Mariana Costa", valor: 84_000, etapa: "lead", dias: 2, responsavel: "RA" },
  { id: "n2", empresa: "Nortec Engenharia", contato: "Paulo Henrique", valor: 46_500, etapa: "lead", dias: 5, responsavel: "JL" },
  { id: "n3", empresa: "Clínica Vida Plena", contato: "Dra. Renata Alves", valor: 22_800, etapa: "lead", dias: 1, responsavel: "MS" },
  { id: "n4", empresa: "Alumi Esquadrias", contato: "Felipe Moraes", valor: 61_200, etapa: "qualificado", dias: 8, responsavel: "RA" },
  { id: "n5", empresa: "Transportadora Rota Sul", contato: "Carla Nunes", valor: 128_000, etapa: "qualificado", dias: 12, responsavel: "JL" },
  { id: "n6", empresa: "Lumen Energia Solar", contato: "Thiago Prado", valor: 97_400, etapa: "proposta", dias: 6, responsavel: "MS" },
  { id: "n7", empresa: "Arvo Agronegócio", contato: "Beatriz Lima", valor: 156_000, etapa: "proposta", dias: 15, responsavel: "RA" },
  { id: "n8", empresa: "Colégio Horizonte", contato: "Ricardo Dias", valor: 38_900, etapa: "negociacao", dias: 4, responsavel: "JL" },
  { id: "n9", empresa: "Farmácias Bem Estar", contato: "Juliana Rocha", valor: 212_000, etapa: "negociacao", dias: 21, responsavel: "MS" },
  { id: "n10", empresa: "Vértice Construtora", contato: "André Souza", valor: 74_300, etapa: "fechado", dias: 0, responsavel: "RA" },
];

// Cor do avatar de cada responsável (índice na PALETA).
const RESP: Record<string, number> = { RA: 1, JL: 5, MS: 4 };

const ICONES_KPI = [
  "M4 4h16l-6 8v6l-4 2v-8L4 4z",
  "M3 17l6-6 4 4 8-8M15 7h6v6",
  "M20 6L9 17l-5-5",
];

const brl = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

type Props = {
  accent?: string;
  negocios?: Negocio[];
  onMove?: (id: string, etapa: Etapa) => void;
  tema?: Tema;
  onTemaChange?: (t: Tema) => void;
};

export default function DashPipeline({ accent = "#0057FF", negocios = DADOS, onMove, tema = "claro", onTemaChange }: Props) {
  const [modo, alternarTema] = useTema(tema, onTemaChange);
  const [itens, setItens] = useState<Negocio[]>(negocios);
  const [arrastando, setArrastando] = useState<string | null>(null);
  const [alvo, setAlvo] = useState<Etapa | null>(null);
  const [aviso, setAviso] = useState("");

  const mover = (id: string, etapa: Etapa) => {
    setItens((lista) => lista.map((n) => (n.id === id ? { ...n, etapa, dias: 0 } : n)));
    const neg = itens.find((n) => n.id === id);
    const nome = ETAPAS.find((e) => e.id === etapa)?.nome;
    if (neg) setAviso(`${neg.empresa} movido para ${nome}.`);
    onMove?.(id, etapa);
  };

  const deslocar = (n: Negocio, dir: -1 | 1) => {
    const i = ETAPAS.findIndex((e) => e.id === n.etapa) + dir;
    if (i >= 0 && i < ETAPAS.length) mover(n.id, ETAPAS[i].id);
  };

  const soltar = (e: DragEvent<HTMLElement>, etapa: Etapa) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain") || arrastando;
    if (id) mover(id, etapa);
    setArrastando(null);
    setAlvo(null);
  };

  const total = itens.filter((n) => n.etapa !== "fechado").reduce((s, n) => s + n.valor, 0);
  const ponderado = itens.reduce((s, n) => s + n.valor * (ETAPAS.find((e) => e.id === n.etapa)?.prob ?? 0), 0);
  const fechado = itens.filter((n) => n.etapa === "fechado").reduce((s, n) => s + n.valor, 0);
  const meta = 600_000;
  const botaoMover =
    "grid h-7 w-7 place-items-center rounded-md border border-[var(--fc-border)] text-[var(--fc-muted)] transition-colors hover:bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] hover:text-[var(--accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent)] disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-[var(--fc-muted)]";

  return (
    <div style={{ ...TEMAS[modo], colorScheme: modo === "claro" ? "light" : "dark", "--accent": accent } as CSSProperties} data-tema={modo} className="min-h-full bg-[var(--fc-bg)] p-4 text-[var(--fc-text)] sm:p-6 lg:p-8">
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs text-[var(--fc-subtle)]">CRM · Outubro de 2026</p>
          <h1 className="mt-1 text-xl font-semibold tracking-tight sm:text-2xl">Pipeline comercial</h1>
        </div>
        <BotaoTema tema={modo} onClick={alternarTema} />
      </header>

      <section aria-label="Resumo do pipeline" className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[
          { l: "Em aberto", v: brl(total), s: `${itens.filter((n) => n.etapa !== "fechado").length} negócios ativos` },
          { l: "Previsão ponderada", v: brl(ponderado), s: "valor × probabilidade da etapa" },
          { l: "Fechado no mês", v: brl(fechado), s: `${Math.round((fechado / meta) * 100)}% da meta de ${brl(meta)}` },
        ].map((k, i) => {
          const cor = PALETA[i % PALETA.length];
          return (
            <div key={k.l} className="rounded-2xl border border-[var(--fc-border)] bg-[var(--fc-surface)] p-4 shadow-[var(--fc-shadow)]">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-medium text-[var(--fc-muted)]">{k.l}</p>
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg" style={{ background: tinta(cor, 12), color: cor }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d={ICONES_KPI[i % ICONES_KPI.length]} />
                  </svg>
                </span>
              </div>
              <p className="mt-1.5 text-2xl font-semibold tabular-nums tracking-tight">{k.v}</p>
              <p className="mt-1 text-xs text-[var(--fc-subtle)]">{k.s}</p>
              {i === 2 && (
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[var(--fc-surface-2)]">
                  <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, (fechado / meta) * 100)}%`, background: `linear-gradient(90deg, var(--accent), ${PALETA[2]})` }} />
                </div>
              )}
            </div>
          );
        })}
      </section>

      <p role="status" aria-live="polite" className="sr-only">
        {aviso}
      </p>

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {ETAPAS.map((etapa, ei) => {
          const cards = itens.filter((n) => n.etapa === etapa.id);
          const soma = cards.reduce((s, n) => s + n.valor, 0);
          const cor = PALETA[ei % PALETA.length];
          const sobre = alvo === etapa.id;
          return (
            <section
              key={etapa.id}
              aria-label={`${etapa.nome}: ${cards.length} negócios`}
              onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = "move";
                if (alvo !== etapa.id) setAlvo(etapa.id);
              }}
              onDragLeave={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget as Node)) setAlvo(null);
              }}
              onDrop={(e) => soltar(e, etapa.id)}
              className={`flex min-w-0 flex-col rounded-2xl border border-t-2 p-3 transition-colors ${sobre ? "border-[var(--accent)] bg-[color-mix(in_srgb,var(--accent)_7%,transparent)]" : "border-[var(--fc-border)] bg-[color-mix(in_srgb,var(--fc-surface-2)_55%,transparent)]"}`}
              style={sobre ? undefined : { borderTopColor: cor }}
            >
              <div className="flex items-center justify-between px-1">
                <h2 className="flex items-center gap-2 text-sm font-medium">
                  <span className="h-2 w-2 rounded-full" style={{ background: cor }} />
                  {etapa.nome}
                  <span className="rounded-md px-1.5 text-[11px] font-medium tabular-nums" style={{ background: tinta(cor, 12), color: cor }} data-contagem={etapa.id}>
                    {cards.length}
                  </span>
                </h2>
                <span className="text-[11px] text-[var(--fc-subtle)]">{Math.round(etapa.prob * 100)}%</span>
              </div>
              <p className="mt-1 px-1 text-xs tabular-nums text-[var(--fc-muted)]">{brl(soma)}</p>

              <ul className="mt-3 flex min-h-[72px] flex-1 flex-col gap-2 xl:min-h-[120px]">
                {cards.map((n) => {
                  const corResp = PALETA[(RESP[n.responsavel] ?? 0) % PALETA.length];
                  return (
                    <li
                      key={n.id}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData("text/plain", n.id);
                        e.dataTransfer.effectAllowed = "move";
                        setArrastando(n.id);
                      }}
                      onDragEnd={() => {
                        setArrastando(null);
                        setAlvo(null);
                      }}
                      className={`group cursor-grab rounded-xl border border-[var(--fc-border)] bg-[var(--fc-pop)] p-3 shadow-[var(--fc-shadow)] transition active:cursor-grabbing motion-safe:hover:-translate-y-0.5 hover:border-[var(--fc-border-strong)] ${arrastando === n.id ? "opacity-40" : ""}`}
                    >
                      <article aria-label={n.empresa}>
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-medium leading-snug text-[var(--fc-text)]">{n.empresa}</p>
                          <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full text-[10px] font-semibold" style={{ background: tinta(corResp, 14), color: corResp }} title={`Responsável: ${n.responsavel}`}>
                            {n.responsavel}
                          </span>
                        </div>
                        <p className="mt-0.5 text-xs text-[var(--fc-subtle)]">{n.contato}</p>
                        <div className="mt-3 flex items-center justify-between gap-2">
                          <span className="text-sm font-semibold tabular-nums">{brl(n.valor)}</span>
                          {n.dias > 14 ? (
                            <span className="rounded-full px-2 py-0.5 text-[11px] font-medium tabular-nums text-[var(--fc-warn)]" style={{ background: tinta("var(--fc-warn)", 12) }}>
                              {n.dias}d na etapa
                            </span>
                          ) : (
                            <span className="text-[11px] tabular-nums text-[var(--fc-subtle)]">{n.dias === 0 ? "hoje" : `${n.dias}d na etapa`}</span>
                          )}
                        </div>
                        <div className="mt-2 flex justify-end gap-1 opacity-100 transition-opacity xl:opacity-0 xl:group-hover:opacity-100 xl:group-focus-within:opacity-100">
                          <button type="button" disabled={ei === 0} onClick={() => deslocar(n, -1)} aria-label={`Mover ${n.empresa} para a etapa anterior`} className={botaoMover}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                              <path d="M15 18l-6-6 6-6" />
                            </svg>
                          </button>
                          <button type="button" disabled={ei === ETAPAS.length - 1} onClick={() => deslocar(n, 1)} aria-label={`Mover ${n.empresa} para a próxima etapa`} className={botaoMover}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                              <path d="M9 18l6-6-6-6" />
                            </svg>
                          </button>
                        </div>
                      </article>
                    </li>
                  );
                })}
                {cards.length === 0 && (
                  <li className="grid flex-1 place-items-center rounded-xl border border-dashed border-[var(--fc-border-strong)] text-xs text-[var(--fc-subtle)]">Solte um negócio aqui</li>
                )}
              </ul>
            </section>
          );
        })}
      </div>

      <footer className="mt-6 flex flex-col gap-2 text-xs text-[var(--fc-subtle)] sm:flex-row sm:items-center sm:justify-between">
        <p>Arraste os cartões entre as etapas ou use as setas de cada cartão.</p>
        <a href="https://flowcoresolucoes.com.br/codigos" target="_blank" rel="noopener" className="text-[11px] text-[var(--fc-subtle)] transition-colors hover:text-[var(--fc-text)]">
          Criado por FlowCore Soluções LTDA
        </a>
      </footer>
    </div>
  );
}
