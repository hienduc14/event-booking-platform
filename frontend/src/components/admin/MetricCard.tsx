export function MetricCard({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <section className="metric-card">
      <span>{label}</span>
      <strong>{value}</strong>
      {hint && <p>{hint}</p>}
    </section>
  );
}
