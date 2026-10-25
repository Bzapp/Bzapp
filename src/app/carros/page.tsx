import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { DataTable, EmptyState, PageTitle, PrimaryLink } from "@/components/ui";
import { getDb } from "@/lib/db";
import { seedIfEmpty } from "@/lib/seed";

export const dynamic = "force-dynamic";

export default function CarrosPage() {
  const db = getDb();
  seedIfEmpty(db);
  const rows = db
    .prepare(
      `SELECT ca.*, cl.nome AS cliente_nome
       FROM carro ca LEFT JOIN cliente cl ON cl.id_cliente = ca.id_cliente
       ORDER BY ca.matricula`
    )
    .all() as Array<{
    id_matricula: number;
    matricula: string;
    marca: string;
    modelo: string;
    kmsAviso: number;
    cliente_nome: string;
  }>;

  return (
    <AppShell active="/carros">
      <PageTitle
        title="Viaturas"
        subtitle="Frota registada — matrícula, marca e cliente."
        action={<PrimaryLink href="/carros/novo">Nova viatura</PrimaryLink>}
      />
      {rows.length === 0 ? (
        <EmptyState message="Ainda não há viaturas." />
      ) : (
        <DataTable headers={["Matrícula", "Marca / modelo", "Cliente", "Kms aviso", ""]}>
          {rows.map((r) => (
            <tr key={r.id_matricula} className="hover:bg-ink-950/[0.02]">
              <td className="px-4 py-3 font-semibold tracking-wide text-ink-950">{r.matricula}</td>
              <td className="px-4 py-3 text-ink-700">
                {r.marca} {r.modelo}
              </td>
              <td className="px-4 py-3 text-ink-700">{r.cliente_nome || "—"}</td>
              <td className="px-4 py-3 tabular-nums text-ink-700">
                {r.kmsAviso?.toLocaleString("pt-PT")}
              </td>
              <td className="px-4 py-3 text-right">
                <Link href={`/carros/${r.id_matricula}`} className="text-sm font-semibold text-oil-600 hover:underline">
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
