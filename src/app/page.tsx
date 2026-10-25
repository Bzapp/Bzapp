import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { Panel, StatusBadge } from "@/components/ui";
import { euro, formatDate, getDb } from "@/lib/db";
import { seedIfEmpty } from "@/lib/seed";

export const dynamic = "force-dynamic";

export default function HomePage() {
  const db = getDb();
  seedIfEmpty(db);

  const stats = {
    clientes: (db.prepare("SELECT COUNT(*) AS c FROM cliente").get() as { c: number }).c,
    carros: (db.prepare("SELECT COUNT(*) AS c FROM carro").get() as { c: number }).c,
    ordensAbertas: (
      db
        .prepare(
          `SELECT COUNT(*) AS c FROM documento_or WHERE LOWER(COALESCE(estado,'')) NOT LIKE '%conclu%'`
        )
        .get() as { c: number }
    ).c,
    faturas: (db.prepare("SELECT COUNT(*) AS c FROM documento_fo").get() as { c: number }).c,
  };

  const recentOrdens = db
    .prepare(
      `SELECT id_documento, n_documento, data_documento, estado, nome, carro_matricula, total
       FROM documento_or ORDER BY data_documento DESC, id_documento DESC LIMIT 5`
    )
    .all() as Array<{
    id_documento: number;
    n_documento: number;
    data_documento: string;
    estado: string;
    nome: string;
    carro_matricula: string;
    total: number;
  }>;

  return (
    <AppShell active="/">
      <section className="animate-rise relative mb-12 overflow-hidden border-b border-ink-900/10 pb-12">
        <p className="font-display text-sm uppercase tracking-[0.3em] text-oil-600">
          Painel da oficina
        </p>
        <h2 className="mt-3 max-w-2xl font-display text-5xl leading-[0.95] tracking-tight text-ink-950 md:text-6xl">
          Trabalho na bancada,
          <span className="relative ml-2 inline-block text-oil-600">
            organizado
            <span className="brand-underline absolute -bottom-1 left-0 h-1 w-full bg-oil-400/70" />
          </span>
          .
        </h2>
        <p className="animate-rise-delay mt-5 max-w-lg text-base text-ink-600">
          Clientes, viaturas, materiais, ordens de reparação e faturas — espelho do domínio
          clássico da oficina.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/ordens/nova"
            className="bg-ink-950 px-5 py-3 text-sm font-semibold text-[#f4efe6] transition hover:bg-oil-600"
          >
            Nova ordem
          </Link>
          <Link
            href="/clientes/novo"
            className="border border-ink-900/20 px-5 py-3 text-sm font-semibold text-ink-800 transition hover:border-ink-900/40"
          >
            Novo cliente
          </Link>
        </div>
      </section>

      <section className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Clientes", value: stats.clientes, href: "/clientes" },
          { label: "Viaturas", value: stats.carros, href: "/carros" },
          { label: "Ordens ativas", value: stats.ordensAbertas, href: "/ordens" },
          { label: "Faturas", value: stats.faturas, href: "/faturas" },
        ].map((s) => (
          <Link key={s.href} href={s.href} className="group block">
            <Panel className="px-5 py-5 transition group-hover:border-oil-500/40">
              <p className="font-display text-xs uppercase tracking-[0.18em] text-ink-500">
                {s.label}
              </p>
              <p className="mt-2 font-display text-4xl text-ink-950">{s.value}</p>
            </Panel>
          </Link>
        ))}
      </section>

      <section>
        <div className="mb-4 flex items-baseline justify-between gap-3">
          <h3 className="font-display text-2xl text-ink-950">Ordens recentes</h3>
          <Link href="/ordens" className="text-sm font-medium text-oil-600 hover:underline">
            Ver todas
          </Link>
        </div>
        <Panel className="divide-y divide-ink-900/8">
          {recentOrdens.map((o) => (
            <Link
              key={o.id_documento}
              href={`/ordens/${o.id_documento}`}
              className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 transition hover:bg-ink-950/[0.03]"
            >
              <div>
                <p className="font-semibold text-ink-950">
                  OR-{o.n_documento} · {o.carro_matricula}
                </p>
                <p className="text-sm text-ink-600">
                  {o.nome} · {formatDate(o.data_documento)}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <StatusBadge estado={o.estado} />
                <span className="font-medium tabular-nums text-ink-900">
                  {euro(o.total)}
                </span>
              </div>
            </Link>
          ))}
        </Panel>
      </section>
    </AppShell>
  );
}
