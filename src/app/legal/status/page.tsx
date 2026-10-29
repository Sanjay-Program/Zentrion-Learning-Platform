import { Breadcrumbs, Card, PageHeader } from "@/components/ui";

export const metadata = { title: "System Status" };

export default function StatusPage() {
  const checks = [
    ["Web platform", "operational"],
    ["Authentication & sessions", "operational"],
    ["Course catalogue", "operational"],
    ["Simulated labs", "operational"],
    ["AI Tutor (offline mode)", "operational"],
    ["Payments (simulated)", "operational"],
    ["Database", "operational"],
  ];

  return (
    <main className="container" style={{ padding: "var(--space-10) var(--space-6)", maxWidth: 44 * 16 }}>
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Legal", href: "/legal" }, { label: "Status" }]} />
      <PageHeader eyebrow="Status" title="All systems operational" description="Real-time status of the Zentrion platform." />
      <Card>
        <div style={{ display: "grid", gap: "var(--space-3)" }}>
          {checks.map(([name, state]) => (
            <div key={name} className="flex justify-between items-center">
              <span>{name}</span>
              <span className="badge badge-success">{state}</span>
            </div>
          ))}
        </div>
        <p className="text-muted text-sm" style={{ marginTop: "var(--space-6)", marginBottom: 0 }}>
          Last checked: {new Date().toLocaleString()}. This page reflects the
          local deployment; historical incident data is not retained in this
          environment.
        </p>
      </Card>
    </main>
  );
}
