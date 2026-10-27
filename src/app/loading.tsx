export default function Loading() {
  return (
    <div className="container" style={{ padding: "var(--space-16) var(--space-6)" }}>
      <div className="skeleton" style={{ width: "60%", height: 32, marginBottom: "var(--space-4)" }} />
      <div className="skeleton" style={{ width: "40%", height: 20, marginBottom: "var(--space-8)" }} />
      <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(18rem, 1fr))", gap: "var(--space-5)" }}>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="card" style={{ padding: "var(--space-6)" }}>
            <div className="skeleton" style={{ width: "30%", height: 16, marginBottom: "var(--space-3)" }} />
            <div className="skeleton" style={{ width: "80%", height: 24, marginBottom: "var(--space-2)" }} />
            <div className="skeleton" style={{ width: "100%", height: 14, marginBottom: "var(--space-2)" }} />
            <div className="skeleton" style={{ width: "90%", height: 14, marginBottom: "var(--space-4)" }} />
            <div className="skeleton" style={{ width: "40%", height: 32 }} />
          </div>
        ))}
      </div>
    </div>
  );
}
