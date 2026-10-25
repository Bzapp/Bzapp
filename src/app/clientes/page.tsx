import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { DataTable, EmptyState, PageTitle, PrimaryLink } from "@/components/ui";
import { formatDate, getDb } from "@/lib/db";
import { seedIfEmpty } from "@/lib/seed";

export const dynamic = "force-dynamic";

export default function ClientesPage() {
  const db = getDb();
  seedIfEmpty(db);
  const rows = db
    .prepare(
      `SELECT c.*, (SELECT COUNT(*) FROM carro WHERE id_cliente = c.id_cliente) AS viaturas
       FROM cliente c ORDER BY c.nome`
    )
    .all() as Array<{
    id_cliente: number;
    nome: string;
    telemovel: string;
    localidade: string;
    data_registo: string;
    viaturas: number;
  }>;

  return (
    <AppShell active="/clientes">
      <PageTitle
        title="Clientes"
        subtitle="Ficha de clientes com contacto e localidade."
        action={<PrimaryLink href="/clientes/novo">Novo cliente</PrimaryLink>}
      />
      {rows.length === 0 ? (
        <EmptyState message="Ainda não há clientes." />
      ) : (
        <DataTable headers={["Nome", "Telemóvel", "Localidade", "Viaturas", "Registo", ""]}>
          {rows.map((r) => (
            <tr key={r.id_cliente} className="hover:bg-ink-950/[0.02]">
              <td className="px-4 py-3 font-medium text-ink-950">{r.nome}</td>
              <td className="px-4 py-3 text-ink-700">{r.telemovel || "—"}</td>
              <td className="px-4 py-3 text-ink-700">{r.localidade || "—"}</td>
              <td className="px-4 py-3 tabular-nums text-ink-700">{r.viaturas}</td>
              <td className="px-4 py-3 text-ink-600">{formatDate(r.data_registo)}</td>
              <td className="px-4 py-3 text-right">
                <Link href={`/clientes/${r.id_cliente}`} className="text-sm font-semibold text-oil-600 hover:underline">
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
