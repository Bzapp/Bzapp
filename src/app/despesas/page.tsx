import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { DataTable, EmptyState, PageTitle, PrimaryLink, StatusBadge } from "@/components/ui";
import { euro, formatDate, getDb } from "@/lib/db";
import { seedIfEmpty } from "@/lib/seed";

export const dynamic = "force-dynamic";

export default function DespesasPage() {
  const db = getDb();
  seedIfEmpty(db);
  const catalogo = db
    .prepare("SELECT * FROM despesas ORDER BY data_registo DESC")
    .all() as Array<{
    id_despesa: number;
    codigo: string;
    descricao: string;
    custo: number;
    custo_iva: number;
    tipo_custo: string;
    data_registo: string;
  }>;
  const docs = db
    .prepare("SELECT * FROM documento_de ORDER BY data_documento DESC")
    .all() as Array<{
    id_documento: number;
    n_documento: number;
    data_documento: string;
    estado: string;
    total: number;
    observacao: string;
  }>;

  return (
    <AppShell active="/despesas">
      <PageTitle
        title="Despesas"
        subtitle="Catálogo de custos e documentos DE."
        action={<PrimaryLink href="/despesas/nova">Nova despesa</PrimaryLink>}
      />

      <h3 className="mb-3 font-display text-2xl text-ink-950">Documentos DE</h3>
      {docs.length === 0 ? (
        <EmptyState message="Sem documentos de despesa." />
      ) : (
        <div className="mb-10">
          <DataTable headers={["Nº", "Data", "Estado", "Observação", "Total", ""]}>
            {docs.map((d) => (
              <tr key={d.id_documento} className="hover:bg-ink-950/[0.02]">
                <td className="px-4 py-3 font-semibold">DE-{d.n_documento}</td>
                <td className="px-4 py-3">{formatDate(d.data_documento)}</td>
                <td className="px-4 py-3">
                  <StatusBadge estado={d.estado} />
                </td>
                <td className="px-4 py-3 text-ink-700">{d.observacao || "—"}</td>
                <td className="px-4 py-3 tabular-nums font-medium">{euro(d.total)}</td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/despesas/doc/${d.id_documento}`} className="text-sm font-semibold text-oil-600 hover:underline">
                    Abrir
                  </Link>
                </td>
              </tr>
            ))}
          </DataTable>
        </div>
      )}

      <h3 className="mb-3 font-display text-2xl text-ink-950">Catálogo</h3>
      {catalogo.length === 0 ? (
        <EmptyState message="Catálogo vazio." />
      ) : (
        <DataTable headers={["Código", "Descrição", "Tipo", "Custo s/ IVA", "C/ IVA", "Data", ""]}>
          {catalogo.map((r) => (
            <tr key={r.id_despesa} className="hover:bg-ink-950/[0.02]">
              <td className="px-4 py-3 font-mono text-xs">{r.codigo}</td>
              <td className="px-4 py-3 font-medium">{r.descricao}</td>
              <td className="px-4 py-3 text-ink-700">{r.tipo_custo}</td>
              <td className="px-4 py-3 tabular-nums">{euro(r.custo)}</td>
              <td className="px-4 py-3 tabular-nums font-medium">{euro(r.custo_iva)}</td>
              <td className="px-4 py-3 text-ink-600">{formatDate(r.data_registo)}</td>
              <td className="px-4 py-3 text-right">
                <Link href={`/despesas/${r.id_despesa}`} className="text-sm font-semibold text-oil-600 hover:underline">
                  Abrir
                </Link>
              </td>
            </tr>
          ))}
        </DataTable>
      )}
    </AppShell>
  );
}
