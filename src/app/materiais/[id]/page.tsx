import { notFound } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { DetailGrid, PageTitle, Panel } from "@/components/ui";
import { euro, formatDate, getDb } from "@/lib/db";
import { seedIfEmpty } from "@/lib/seed";

export const dynamic = "force-dynamic";

export default async function MaterialDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const db = getDb();
  seedIfEmpty(db);
  const m = db
    .prepare("SELECT * FROM material WHERE id_material = ?")
    .get(Number(id)) as Record<string, unknown> | undefined;
  if (!m) notFound();

  return (
    <AppShell active="/materiais">
      <PageTitle title={String(m.descricao)} subtitle={`Código ${m.codigo}`} />
      <Panel className="max-w-2xl p-6">
        <DetailGrid
          items={[
            { label: "Tipo", value: String(m.tipo) },
            { label: "Preço s/ IVA", value: euro(Number(m.preco)) },
            { label: "IVA", value: `${m.iva}%` },
            { label: "Preço c/ IVA", value: euro(Number(m.preco_iva)) },
            { label: "Registo", value: formatDate(String(m.data_registo)) },
          ]}
        />
      </Panel>
    </AppShell>
  );
}
