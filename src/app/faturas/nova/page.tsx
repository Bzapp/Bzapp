import { AppShell } from "@/components/AppShell";
import { Field, FormActions, PageTitle, Panel, SelectField } from "@/components/ui";
import { createFatura } from "@/lib/actions";
import { getDb } from "@/lib/db";
import { seedIfEmpty } from "@/lib/seed";

export const dynamic = "force-dynamic";

export default function NovaFaturaPage() {
  const db = getDb();
  seedIfEmpty(db);
  const clientes = db
    .prepare("SELECT id_cliente, nome FROM cliente ORDER BY nome")
    .all() as Array<{ id_cliente: number; nome: string }>;
  const carros = db
    .prepare(`SELECT matricula, marca, modelo FROM carro ORDER BY matricula`)
    .all() as Array<{ matricula: string; marca: string; modelo: string }>;

  return (
    <AppShell active="/faturas">
      <PageTitle title="Nova fatura" subtitle="Emitir documento FO." />
      <Panel className="max-w-2xl p-6">
        <form action={createFatura} className="grid gap-4 sm:grid-cols-2">
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
          <Field label="Kms" name="kms" />
          <SelectField
            label="Estado"
            name="estado"
            defaultValue="Emitida"
            options={[
              { value: "Emitida", label: "Emitida" },
              { value: "Paga", label: "Paga" },
              { value: "Anulada", label: "Anulada" },
            ]}
          />
          <div className="sm:col-span-2">
            <Field label="Observação" name="observacao" />
          </div>
          <div className="sm:col-span-2">
            <FormActions cancelHref="/faturas" />
          </div>
        </form>
      </Panel>
    </AppShell>
  );
}
