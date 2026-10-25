import { notFound } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { DataTable, DetailGrid, PageTitle, Panel, StatusBadge } from "@/components/ui";
import { euro, formatDate, getDb } from "@/lib/db";
import { seedIfEmpty } from "@/lib/seed";

export const dynamic = "force-dynamic";

export default async function OrdemDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const db = getDb();
  seedIfEmpty(db);
  const doc = db
    .prepare("SELECT * FROM documento_or WHERE id_documento = ?")
    .get(Number(id)) as Record<string, unknown> | undefined;
  if (!doc) notFound();

  const linhas = db
    .prepare(
      `SELECT * FROM linhas_documento_or WHERE id_documento = ? ORDER BY linha`
    )
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
    <AppShell active="/ordens">
      <PageTitle
        title={`OR-${doc.n_documento}`}
        subtitle={`${doc.carro_matricula} · ${doc.marca} ${doc.modelo}`}
        action={<StatusBadge estado={String(doc.estado)} />}
      />
      <div className="mb-6 grid gap-6 lg:grid-cols-2">
        <Panel className="p-6">
          <h3 className="mb-4 font-display text-xl">Cliente / viatura</h3>
          <DetailGrid
            items={[
              { label: "Cliente", value: String(doc.nome) },
              { label: "Contacto", value: String(doc.telemovel || doc.telefone || "—") },
              { label: "Localidade", value: String(doc.localidade || "—") },
              { label: "Kms", value: String(doc.kms || "—") },
            ]}
          />
        </Panel>
        <Panel className="p-6">
          <h3 className="mb-4 font-display text-xl">Documento</h3>
          <DetailGrid
            items={[
              { label: "Data", value: formatDate(String(doc.data_documento)) },
              { label: "Tempo previsto", value: doc.tempo_previsto != null ? `${doc.tempo_previsto} h` : "—" },
              { label: "Observação", value: String(doc.observacao || "—") },
              {
                label: "Totais",
                value: `${euro(Number(doc.total_geral_sem_iva))} s/ IVA · ${euro(Number(doc.total))} c/ IVA`,
              },
            ]}
          />
        </Panel>
      </div>
      <h3 className="mb-3 font-display text-2xl text-ink-950">Linhas</h3>
      {linhas.length === 0 ? (
        <Panel className="px-6 py-8 text-sm text-ink-600">Sem linhas nesta ordem.</Panel>
      ) : (
        <DataTable
          headers={["#", "Artigo", "Descrição", "Qtd", "P. unit.", "IVA", "Linha", "Mecânico"]}
        >
          {linhas.map((l) => (
            <tr key={l.linha}>
              <td className="px-4 py-3 tabular-nums">{l.linha}</td>
              <td className="px-4 py-3 font-mono text-xs">{l.c_artigo}</td>
              <td className="px-4 py-3">
                <span className="font-medium">{l.descricao}</span>
                <span className="mt-0.5 block text-xs text-ink-500">{l.tipo_material}</span>
              </td>
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
