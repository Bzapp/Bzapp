import { AppShell } from "@/components/AppShell";
import { Field, FormActions, PageTitle, Panel, SelectField } from "@/components/ui";
import { createOrdem } from "@/lib/actions";
import { getDb } from "@/lib/db";
import { seedIfEmpty } from "@/lib/seed";

export const dynamic = "force-dynamic";

export default function NovaOrdemPage() {
  const db = getDb();
  seedIfEmpty(db);
  const clientes = db
    .prepare("SELECT id_cliente, nome FROM cliente ORDER BY nome")
    .all() as Array<{ id_cliente: number; nome: string }>;
  const carros = db
    .prepare(
      `SELECT matricula, marca, modelo, id_cliente FROM carro ORDER BY matricula`
    )
    .all() as Array<{ matricula: string; marca: string; modelo: string; id_cliente: number }>;

  return (
    <AppShell active="/ordens">
      <PageTitle title="Nova ordem" subtitle="Abrir documento OR para uma viatura." />
      <Panel className="max-w-2xl p-6">
        <form action={createOrdem} className="grid gap-4 sm:grid-cols-2">
          <SelectField
            label="Cliente"
            name="id_cliente"
            required
            options={clientes.map((c) => ({ value: c.id_cliente, label: c.nome }))}
          />
          <SelectField
            label="Matrícula"
            name="carro_matricula"
            required
            options={carros.map((c) => ({
              value: c.matricula,
              label: `${c.matricula} — ${c.marca} ${c.modelo}`,
            }))}
          />
          <Field label="Kms atuais" name="kms" />
          <Field label="Tempo previsto (h)" name="tempo_previsto" type="number" step="0.5" />
          <SelectField
            label="Estado"
            name="estado"
            defaultValue="Aberta"
            options={[
              { value: "Aberta", label: "Aberta" },
              { value: "Em curso", label: "Em curso" },
              { value: "Concluída", label: "Concluída" },
            ]}
          />
          <div className="sm:col-span-2">
            <Field label="Observação" name="observacao" />
          </div>
          <div className="sm:col-span-2">
            <FormActions cancelHref="/ordens" />
          </div>
        </form>
      </Panel>
    </AppShell>
  );
}
