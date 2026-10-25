import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { DataTable, EmptyState, PageTitle, PrimaryLink, StatusBadge } from "@/components/ui";
import { euro, formatDate, getDb } from "@/lib/db";
import { seedIfEmpty } from "@/lib/seed";

export const dynamic = "force-dynamic";

export default function FaturasPage() {
  const db = getDb();
  seedIfEmpty(db);
  const rows = db
    .prepare(`SELECT * FROM documento_fo ORDER BY data_documento DESC, n_documento DESC`)
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
    <AppShell active="/faturas">
      <PageTitle
        title="Faturas"
        subtitle="Documentos FO — faturação ao cliente."
        action={<PrimaryLink href="/faturas/nova">Nova fatura</PrimaryLink>}
      />
      {rows.length === 0 ? (
        <EmptyState message="Sem faturas." />
      ) : (
        <DataTable headers={["Nº", "Data", "Cliente", "Matrícula", "Estado", "Total", ""]}>
          {rows.map((r) => (
            <tr key={r.id_documento} className="hover:bg-ink-950/[0.02]">
              <td className="px-4 py-3 font-semibold text-ink-950">FO-{r.n_documento}</td>
              <td className="px-4 py-3 text-ink-700">{formatDate(r.data_documento)}</td>
              <td className="px-4 py-3 text-ink-700">{r.nome}</td>
              <td className="px-4 py-3 font-medium tracking-wide">{r.carro_matricula}</td>
              <td className="px-4 py-3">
                <StatusBadge estado={r.estado} />
              </td>
              <td className="px-4 py-3 tabular-nums font-medium">{euro(r.total)}</td>
              <td className="px-4 py-3 text-right">
                <Link href={`/faturas/${r.id_documento}`} className="text-sm font-semibold text-oil-600 hover:underline">
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
