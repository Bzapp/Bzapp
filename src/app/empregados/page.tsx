import { AppShell } from "@/components/AppShell";
import { DataTable, EmptyState, PageTitle } from "@/components/ui";
import { formatDate, getDb } from "@/lib/db";
import { seedIfEmpty } from "@/lib/seed";

export const dynamic = "force-dynamic";

export default function EmpregadosPage() {
  const db = getDb();
  seedIfEmpty(db);
  const rows = db
    .prepare("SELECT * FROM empregado ORDER BY nome")
    .all() as Array<{
    id_empregado: number;
    nome_abreviado: string;
    nome: string;
    telemovel: string;
    categoria: string;
    localidade: string;
    data_registo: string;
  }>;

  return (
    <AppShell active="/empregados">
      <PageTitle
        title="Equipa"
        subtitle="Empregados da oficina (mão de obra nas linhas)."
      />
      {rows.length === 0 ? (
        <EmptyState message="Sem empregados." />
      ) : (
        <DataTable headers={["Abrev.", "Nome", "Categoria", "Telemóvel", "Localidade", "Desde"]}>
          {rows.map((r) => (
            <tr key={r.id_empregado}>
              <td className="px-4 py-3 font-semibold text-oil-700">{r.nome_abreviado}</td>
              <td className="px-4 py-3 font-medium text-ink-950">{r.nome}</td>
              <td className="px-4 py-3 text-ink-700">{r.categoria}</td>
              <td className="px-4 py-3 text-ink-700">{r.telemovel}</td>
              <td className="px-4 py-3 text-ink-700">{r.localidade}</td>
              <td className="px-4 py-3 text-ink-600">{formatDate(r.data_registo)}</td>
            </tr>
          ))}
        </DataTable>
      )}
    </AppShell>
  );
}
