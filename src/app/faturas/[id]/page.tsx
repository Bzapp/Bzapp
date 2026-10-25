import { notFound } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { DataTable, DetailGrid, PageTitle, Panel, StatusBadge } from "@/components/ui";
import { euro, formatDate, getDb } from "@/lib/db";
import { seedIfEmpty } from "@/lib/seed";

export const dynamic = "force-dynamic";

export default async function FaturaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const db = getDb();
  seedIfEmpty(db);
  const doc = db
    .prepare("SELECT * FROM documento_fo WHERE id_documento = ?")
    .get(Number(id)) as Record<string, unknown> | undefined;
  if (!doc) notFound();

  const linhas = db
    .prepare(`SELECT * FROM linhas_documento_fo WHERE id_documento = ? ORDER BY linha`)
    .all(Number(id)) as Array<{
    linha: number;
    c_artigo: string;
    descricao: string;
    quantidade: number;
    preco_unitario: number;
    iva: number;
    preco_linha: number;
    nome_empregado_mo: string;
    tipo_material: string;
  }>;

  return (
    <AppShell active="/faturas">
      <PageTitle
        title={`FO-${doc.n_documento}`}
        subtitle={`${doc.nome} · ${doc.carro_matricula}`}
        action={<StatusBadge estado={String(doc.estado)} />}
      />
      <div className="mb-6 grid gap-6 lg:grid-cols-2">
        <Panel className="p-6">
          <DetailGrid
            items={[
              { label: "Data", value: formatDate(String(doc.data_documento)) },
              { label: "Viatura", value: `${doc.marca} ${doc.modelo}` },
              { label: "Morada", value: String(doc.morada || "—") },
              { label: "Observação", value: String(doc.observacao || "—") },
            ]}
          />
        </Panel>
        <Panel className="p-6">
          <DetailGrid
            items={[
              { label: "Total s/ IVA", value: euro(Number(doc.total_geral_sem_iva)) },
              { label: "Total c/ IVA", value: euro(Number(doc.total)) },
              { label: "Custo compra", value: euro(Number(doc.total_compra)) },
              { label: "Convertido de OR", value: Number(doc.convertido) ? "Sim" : "Não" },
            ]}
          />
        </Panel>
      </div>
      <h3 className="mb-3 font-display text-2xl">Linhas</h3>
      {linhas.length === 0 ? (
        <Panel className="px-6 py-8 text-sm text-ink-600">Sem linhas nesta fatura.</Panel>
      ) : (
        <DataTable headers={["#", "Artigo", "Descrição", "Qtd", "P. unit.", "IVA", "Linha", "Resp."]}>
          {linhas.map((l) => (
            <tr key={l.linha}>
              <td className="px-4 py-3 tabular-nums">{l.linha}</td>
              <td className="px-4 py-3 font-mono text-xs">{l.c_artigo}</td>
              <td className="px-4 py-3 font-medium">{l.descricao}</td>
              <td className="px-4 py-3 tabular-nums">{l.quantidade}</td>
              <td className="px-4 py-3 tabular-nums">{euro(l.preco_unitario)}</td>
              <td className="px-4 py-3 tabular-nums">{l.iva}%</td>
              <td className="px-4 py-3 tabular-nums font-medium">{euro(l.preco_linha)}</td>
              <td className="px-4 py-3">{l.nome_empregado_mo}</td>
            </tr>
          ))}
        </DataTable>
      )}
    </AppShell>
  );
}
