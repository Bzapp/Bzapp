import { AppShell } from "@/components/AppShell";
import { Field, FormActions, PageTitle, Panel } from "@/components/ui";
import { createMaterial } from "@/lib/actions";

export default function NovoMaterialPage() {
  return (
    <AppShell active="/materiais">
      <PageTitle title="Novo material" subtitle="Artigo ou serviço para as linhas de documento." />
      <Panel className="max-w-2xl p-6">
        <form action={createMaterial} className="grid gap-4 sm:grid-cols-2">
          <Field label="Código" name="codigo" required placeholder="FIL-OLE" />
          <Field label="Tipo" name="tipo" required placeholder="Filtro" />
          <div className="sm:col-span-2">
            <Field label="Descrição" name="descricao" required />
          </div>
          <Field label="Preço s/ IVA (€)" name="preco" type="number" step="0.01" required />
          <Field label="IVA (%)" name="iva" type="number" defaultValue={23} />
          <div className="sm:col-span-2">
            <FormActions cancelHref="/materiais" />
          </div>
        </form>
      </Panel>
    </AppShell>
  );
}
