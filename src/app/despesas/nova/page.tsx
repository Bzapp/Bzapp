import { AppShell } from "@/components/AppShell";
import { Field, FormActions, PageTitle, Panel } from "@/components/ui";
import { createDespesa } from "@/lib/actions";

export default function NovaDespesaPage() {
  return (
    <AppShell active="/despesas">
      <PageTitle title="Nova despesa" subtitle="Adicionar custo ao catálogo." />
      <Panel className="max-w-2xl p-6">
        <form action={createDespesa} className="grid gap-4 sm:grid-cols-2">
          <Field label="Código" name="codigo" required />
          <Field label="Tipo de custo" name="tipo_custo" required placeholder="Utilities" />
          <div className="sm:col-span-2">
            <Field label="Descrição" name="descricao" required />
          </div>
          <Field label="Custo s/ IVA (€)" name="custo" type="number" step="0.01" required />
          <Field label="IVA (%)" name="iva" type="number" defaultValue={23} />
          <div className="sm:col-span-2">
            <FormActions cancelHref="/despesas" />
          </div>
        </form>
      </Panel>
    </AppShell>
  );
}
