import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { DetailGrid, PageTitle, Panel, PrimaryLink, StatusBadge } from "@/components/ui";
import { euro, formatDate, getDb } from "@/lib/db";
import { seedIfEmpty } from "@/lib/seed";

export const dynamic = "force-dynamic";

export default async function CarroDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const db = getDb();
  seedIfEmpty(db);
  const carro = db
    .prepare(
      `SELECT ca.*, cl.nome AS cliente_nome
       FROM carro ca LEFT JOIN cliente cl ON cl.id_cliente = ca.id_cliente
       WHERE ca.id_matricula = ?`
    )
    .get(Number(id)) as Record<string, unknown> | undefined;
  if (!carro) notFound();

  const ordens = db
    .prepare(
      `SELECT id_documento, n_documento, data_documento, estado, total
       FROM documento_or WHERE carro_matricula = ? ORDER BY data_documento DESC`
    )
    .all(String(carro.matricula)) as Array<{
    id_documento: number;
    n_documento: number;
    data_documento: string;
    estado: string;
    total: number;
  }>;

  return (
    <AppShell active="/carros">
      <PageTitle
        title={String(carro.matricula)}
        subtitle={`${carro.marca} ${carro.modelo}`}
        action={<PrimaryLink href="/ordens/nova">Nova ordem</PrimaryLink>}
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel className="p-6">
          <DetailGrid
            items={[
              {
                label: "Cliente",
                value: (
                  <Link href={`/clientes/${carro.id_cliente}`} className="font-semibold text-oil-600 hover:underline">
                    {String(carro.cliente_nome || "—")}
                  </Link>
                ),
              },
              { label: "Kms aviso", value: Number(carro.kmsAviso).toLocaleString("pt-PT") },
              { label: "Registo", value: formatDate(String(carro.data_registo)) },
              { label: "Observações", value: String(carro.obs || "—") },
            ]}
          />
        </Panel>
        <Panel className="p-6">
          <h3 className="mb-4 font-display text-xl text-ink-950">Ordens desta viatura</h3>
          {ordens.length === 0 ? (
            <p className="text-sm text-ink-600">Sem ordens.</p>
          ) : (
            <ul className="divide-y divide-ink-900/10">
              {ordens.map((o) => (
                <li key={o.id_documento} className="flex items-center justify-between gap-3 py-3">
                  <div>
                    <Link href={`/ordens/${o.id_documento}`} className="font-semibold text-ink-950 hover:text-oil-600">
                      OR-{o.n_documento}
                    </Link>
                    <p className="text-sm text-ink-600">{formatDate(o.data_documento)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge estado={o.estado} />
                    <span className="tabular-nums text-sm">{euro(o.total)}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </AppShell>
  );
}
