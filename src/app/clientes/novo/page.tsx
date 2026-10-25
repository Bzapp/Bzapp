import { AppShell } from "@/components/AppShell";
import { Field, FormActions, PageTitle, Panel } from "@/components/ui";
import { createCliente } from "@/lib/actions";

export default function NovoClientePage() {
  return (
    <AppShell active="/clientes">
      <PageTitle title="Novo cliente" subtitle="Registar contacto na oficina." />
      <Panel className="max-w-2xl p-6">
        <form action={createCliente} className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Field label="Nome" name="nome" required placeholder="Nome completo ou empresa" />
          </div>
          <div className="sm:col-span-2">
            <Field label="Morada" name="morada" />
          </div>
          <Field label="Telefone" name="telefone" />
          <Field label="Telemóvel" name="telemovel" />
          <Field label="Código postal" name="c_postal" />
          <Field label="Localidade" name="localidade" />
          <div className="sm:col-span-2">
            <FormActions cancelHref="/clientes" />
          </div>
        </form>
      </Panel>
    </AppShell>
  );
}
