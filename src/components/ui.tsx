import Link from "next/link";

export function PageTitle({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h2 className="font-display text-3xl tracking-tight text-ink-950 md:text-4xl">
          {title}
        </h2>
        {subtitle ? (
          <p className="mt-1 max-w-xl text-sm text-ink-600">{subtitle}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}

export function PrimaryLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="inline-flex items-center bg-ink-950 px-4 py-2.5 text-sm font-semibold text-[#f4efe6] transition hover:bg-oil-600"
    >
      {children}
    </Link>
  );
}

export function StatusBadge({ estado }: { estado: string | null | undefined }) {
  const e = (estado || "—").toLowerCase();
  let tone = "bg-ink-200 text-ink-800";
  if (e.includes("curso") || e.includes("aberta") || e.includes("emitida")) {
    tone = "bg-oil-300/40 text-oil-700";
  } else if (e.includes("conclu") || e.includes("paga") || e.includes("regist")) {
    tone = "bg-steel-400/20 text-steel-600";
  }
  return (
    <span className={`inline-block px-2 py-0.5 text-xs font-semibold uppercase tracking-wide ${tone}`}>
      {estado || "—"}
    </span>
  );
}

export function Panel({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`border border-ink-900/10 bg-[#faf7f1]/85 shadow-panel backdrop-blur-sm ${className}`}
    >
      {children}
    </div>
  );
}

export function DataTable({
  headers,
  children,
}: {
  headers: string[];
  children: React.ReactNode;
}) {
  return (
    <Panel className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-ink-900/10 bg-ink-950/[0.03]">
              {headers.map((h) => (
                <th
                  key={h}
                  className="px-4 py-3 font-display text-xs uppercase tracking-[0.12em] text-ink-600"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-900/8">{children}</tbody>
        </table>
      </div>
    </Panel>
  );
}

export function Field({
  label,
  name,
  type = "text",
  required,
  defaultValue,
  placeholder,
  step,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  defaultValue?: string | number;
  placeholder?: string;
  step?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ink-600">
        {label}
      </span>
      <input
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue}
        placeholder={placeholder}
        step={step}
        className="w-full border border-ink-900/15 bg-white/70 px-3 py-2.5 text-sm text-ink-950 outline-none ring-oil-400/40 transition focus:ring-2"
      />
    </label>
  );
}

export function SelectField({
  label,
  name,
  required,
  options,
  defaultValue,
}: {
  label: string;
  name: string;
  required?: boolean;
  defaultValue?: string | number;
  options: { value: string | number; label: string }[];
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ink-600">
        {label}
      </span>
      <select
        name={name}
        required={required}
        defaultValue={defaultValue}
        className="w-full border border-ink-900/15 bg-white/70 px-3 py-2.5 text-sm text-ink-950 outline-none ring-oil-400/40 transition focus:ring-2"
      >
        <option value="">Selecionar…</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function FormActions({ cancelHref }: { cancelHref: string }) {
  return (
    <div className="flex flex-wrap gap-3 pt-2">
      <button
        type="submit"
        className="bg-ink-950 px-5 py-2.5 text-sm font-semibold text-[#f4efe6] transition hover:bg-oil-600"
      >
        Guardar
      </button>
      <Link
        href={cancelHref}
        className="border border-ink-900/20 px-5 py-2.5 text-sm font-medium text-ink-700 transition hover:border-ink-900/40"
      >
        Cancelar
      </Link>
    </div>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <Panel className="px-6 py-12 text-center text-sm text-ink-600">{message}</Panel>
  );
}

export function DetailGrid({
  items,
}: {
  items: { label: string; value: React.ReactNode }[];
}) {
  return (
    <dl className="grid gap-4 sm:grid-cols-2">
      {items.map((item) => (
        <div key={item.label}>
          <dt className="text-xs font-semibold uppercase tracking-wider text-ink-500">
            {item.label}
          </dt>
          <dd className="mt-1 text-sm text-ink-900">{item.value || "—"}</dd>
        </div>
      ))}
    </dl>
  );
}
