import { notFound } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { DataTable, DetailGrid, PageTitle, Panel, StatusBadge } from "@/components/ui";
import { euro, formatDate, getDb } from "@/lib/db";
import { seedIfEmpty } from "@/lib/seed";

export const dynamic = "force-dynamic";

export default async function DocumentoDePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const db = getDb();
  seedIfEmpty(db);
  const doc = db
    .prepare("SELECT * FROM documento_de WHERE id_documento = ?")
    .get(Number(id)) as Record<string, unknown> | undefined;
  if (!doc) notFound();

  const linhas = db
    .prepare(`SELECT * FROM linhas_documento_de WHERE id_documento = ? ORDER BY linha`)
    .all(Number(id)) as Array<{
    linha: number;
    codigo: string;
    descricao: string;
    quantidade: number;
    custo_unitario: number;
    iva: number;
    custo_linha: number;
    nome_empregado_mo: string;
    tipo_despesa: string;
  }>;

  return (
    <AppShell active="/despesas">
      <PageTitle
        title={`DE-${doc.n_documento}`}
        subtitle={String(doc.observacao || "Documento de despesas")}
        action={<StatusBadge estado={String(doc.estado)} />}
      />
      <Panel className="mb-6 max-w-2xl p-6">
        <DetailGrid
          items={[
            { label: "Data", value: formatDate(String(doc.data_documento)) },
            { label: "Total s/ IVA", value: euro(Number(doc.total_sem_iva)) },
            { label: "Total c/ IVA", value: euro(Number(doc.total)) },
          ]}
        />
      </Panel>
      <DataTable headers={["#", "Código", "Descrição", "Qtd", "Custo", "IVA", "Linha", "Resp."]}>
        {linhas.map((l) => (
          <tr key={l.linha}>
            <td className="px-4 py-3">{l.linha}</td>
            <td className="px-4 py-3 font-mono text-xs">{l.codigo}</td>
            <td className="px-4 py-3">
              {l.descricao}
              <span className="mt-0.5 block text-xs text-ink-500">{l.tipo_despesa}</span>
            </td>
            <td className="px-4 py-3 tabular-nums">{l.quantidade}</td>
            <td className="px-4 py-3 tabular-nums">{euro(l.custo_unitario)}</td>
            <td className="px-4 py-3">{l.iva}%</td>
            <td className="px-4 py-3 tabular-nums font-medium">{euro(l.custo_linha)}</td>
            <td className="px-4 py-3">{l.nome_empregado_mo}</td>
          </tr>
        ))}
      </DataTable>
    </AppShell>
  );
}
