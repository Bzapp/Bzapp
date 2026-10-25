import { AppShell } from "@/components/AppShell";
import { Field, FormActions, PageTitle, Panel, SelectField } from "@/components/ui";
import { createCarro } from "@/lib/actions";
import { getDb } from "@/lib/db";
import { seedIfEmpty } from "@/lib/seed";

export const dynamic = "force-dynamic";

export default function NovaViaturaPage() {
  const db = getDb();
  seedIfEmpty(db);
  const clientes = db
    .prepare("SELECT id_cliente, nome FROM cliente ORDER BY nome")
    .all() as Array<{ id_cliente: number; nome: string }>;

  return (
    <AppShell active="/carros">
      <PageTitle title="Nova viatura" subtitle="Associar matrícula a um cliente." />
      <Panel className="max-w-2xl p-6">
        <form action={createCarro} className="grid gap-4 sm:grid-cols-2">
          <Field label="Matrícula" name="matricula" required placeholder="12-AB-34" />
          <SelectField
            label="Cliente"
            name="id_cliente"
            required
            options={clientes.map((c) => ({ value: c.id_cliente, label: c.nome }))}
          />
          <Field label="Marca" name="marca" required />
          <Field label="Modelo" name="modelo" required />
          <Field label="Kms aviso" name="kmsAviso" type="number" defaultValue={0} />
          <div className="sm:col-span-2">
            <Field label="Observações" name="obs" />
          </div>
          <div className="sm:col-span-2">
            <FormActions cancelHref="/carros" />
          </div>
        </form>
      </Panel>
    </AppShell>
  );
}
