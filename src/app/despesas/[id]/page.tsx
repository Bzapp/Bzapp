import { notFound } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { DetailGrid, PageTitle, Panel } from "@/components/ui";
import { euro, formatDate, getDb } from "@/lib/db";
import { seedIfEmpty } from "@/lib/seed";

export const dynamic = "force-dynamic";

export default async function DespesaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const db = getDb();
  seedIfEmpty(db);
  const d = db
    .prepare("SELECT * FROM despesas WHERE id_despesa = ?")
    .get(Number(id)) as Record<string, unknown> | undefined;
  if (!d) notFound();

  return (
    <AppShell active="/despesas">
      <PageTitle title={String(d.descricao)} subtitle={`Código ${d.codigo}`} />
      <Panel className="max-w-2xl p-6">
        <DetailGrid
          items={[
            { label: "Tipo", value: String(d.tipo_custo) },
            { label: "Custo s/ IVA", value: euro(Number(d.custo)) },
            { label: "IVA", value: `${d.iva}%` },
            { label: "Custo c/ IVA", value: euro(Number(d.custo_iva)) },
            { label: "Registo", value: formatDate(String(d.data_registo)) },
          ]}
        />
      </Panel>
    </AppShell>
  );
}
