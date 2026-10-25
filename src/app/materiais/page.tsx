import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { DataTable, EmptyState, PageTitle, PrimaryLink } from "@/components/ui";
import { euro, getDb } from "@/lib/db";
import { seedIfEmpty } from "@/lib/seed";

export const dynamic = "force-dynamic";

export default function MateriaisPage() {
  const db = getDb();
  seedIfEmpty(db);
  const rows = db
    .prepare("SELECT * FROM material ORDER BY tipo, descricao")
    .all() as Array<{
    id_material: number;
    codigo: string;
    descricao: string;
    preco: number;
    iva: number;
    preco_iva: number;
    tipo: string;
  }>;

  return (
    <AppShell active="/materiais">
      <PageTitle
        title="Materiais"
        subtitle="Peças, lubrificantes e mão de obra tarifada."
        action={<PrimaryLink href="/materiais/novo">Novo material</PrimaryLink>}
      />
      {rows.length === 0 ? (
        <EmptyState message="Sem materiais no stock." />
      ) : (
        <DataTable headers={["Código", "Descrição", "Tipo", "Preço s/ IVA", "IVA", "P.V.P.", ""]}>
          {rows.map((r) => (
            <tr key={r.id_material} className="hover:bg-ink-950/[0.02]">
              <td className="px-4 py-3 font-mono text-xs text-ink-800">{r.codigo}</td>
              <td className="px-4 py-3 font-medium text-ink-950">{r.descricao}</td>
              <td className="px-4 py-3 text-ink-700">{r.tipo}</td>
              <td className="px-4 py-3 tabular-nums">{euro(r.preco)}</td>
              <td className="px-4 py-3 tabular-nums text-ink-600">{r.iva}%</td>
              <td className="px-4 py-3 tabular-nums font-medium">{euro(r.preco_iva)}</td>
              <td className="px-4 py-3 text-right">
                <Link href={`/materiais/${r.id_material}`} className="text-sm font-semibold text-oil-600 hover:underline">
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
