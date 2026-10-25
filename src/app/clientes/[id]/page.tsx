import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { DetailGrid, PageTitle, Panel, PrimaryLink } from "@/components/ui";
import { formatDate, getDb } from "@/lib/db";
import { seedIfEmpty } from "@/lib/seed";

export const dynamic = "force-dynamic";

export default async function ClienteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const db = getDb();
  seedIfEmpty(db);
  const cliente = db
    .prepare("SELECT * FROM cliente WHERE id_cliente = ?")
    .get(Number(id)) as Record<string, unknown> | undefined;
  if (!cliente) notFound();

  const carros = db
    .prepare("SELECT * FROM carro WHERE id_cliente = ? ORDER BY matricula")
    .all(Number(id)) as Array<{
    id_matricula: number;
    matricula: string;
    marca: string;
    modelo: string;
  }>;

  return (
    <AppShell active="/clientes">
      <PageTitle
        title={String(cliente.nome)}
        subtitle={`Cliente #${cliente.id_cliente} · registado em ${formatDate(String(cliente.data_registo))}`}
        action={<PrimaryLink href="/carros/novo">Associar viatura</PrimaryLink>}
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel className="p-6">
          <h3 className="mb-4 font-display text-xl text-ink-950">Contacto</h3>
          <DetailGrid
            items={[
              { label: "Morada", value: String(cliente.morada || "—") },
              { label: "Localidade", value: `${cliente.c_postal || ""} ${cliente.localidade || ""}`.trim() || "—" },
              { label: "Telefone", value: String(cliente.telefone || "—") },
              { label: "Telemóvel", value: String(cliente.telemovel || "—") },
            ]}
          />
        </Panel>
        <Panel className="p-6">
          <h3 className="mb-4 font-display text-xl text-ink-950">Viaturas</h3>
          {carros.length === 0 ? (
            <p className="text-sm text-ink-600">Sem viaturas associadas.</p>
          ) : (
            <ul className="divide-y divide-ink-900/10">
              {carros.map((c) => (
                <li key={c.id_matricula} className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-semibold text-ink-950">{c.matricula}</p>
                    <p className="text-sm text-ink-600">
                      {c.marca} {c.modelo}
                    </p>
                  </div>
                  <Link href={`/carros/${c.id_matricula}`} className="text-sm font-semibold text-oil-600 hover:underline">
                    Ver
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </AppShell>
  );
}
