import Link from "next/link";

const NAV = [
  { href: "/", label: "Painel" },
  { href: "/clientes", label: "Clientes" },
  { href: "/carros", label: "Viaturas" },
  { href: "/materiais", label: "Materiais" },
  { href: "/ordens", label: "Ordens" },
  { href: "/faturas", label: "Faturas" },
  { href: "/despesas", label: "Despesas" },
  { href: "/empregados", label: "Equipa" },
];

export function AppShell({
  children,
  active,
}: {
  children: React.ReactNode;
  active?: string;
}) {
  return (
    <div className="min-h-screen">
      <div className="workshop-atmosphere" aria-hidden />
      <header className="relative z-10 border-b border-ink-900/10 bg-[#f4efe6]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-end justify-between gap-6 px-5 pb-4 pt-6 md:px-8">
          <Link href="/" className="group block">
            <p className="font-display text-[0.7rem] uppercase tracking-[0.35em] text-oil-600">
              Oficina
            </p>
            <h1 className="font-display text-4xl leading-none tracking-tight text-ink-950 transition group-hover:text-oil-600 md:text-5xl">
              Mecânica
            </h1>
          </Link>
          <p className="hidden max-w-[14rem] pb-1 text-right text-sm leading-snug text-ink-600 sm:block">
            Gestão de oficina — clientes, ordens e faturas num só sítio.
          </p>
        </div>
        <nav className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-5 pb-3 md:px-8">
          {NAV.map((item) => {
            const isActive =
              active === item.href ||
              (item.href !== "/" && active?.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`whitespace-nowrap px-3 py-2 text-sm font-medium transition ${
                  isActive
                    ? "border-b-2 border-oil-500 text-ink-950"
                    : "border-b-2 border-transparent text-ink-600 hover:text-ink-900"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </header>
      <main className="relative z-10 mx-auto max-w-6xl px-5 py-8 md:px-8 md:py-10">
        {children}
      </main>
    </div>
  );
}
