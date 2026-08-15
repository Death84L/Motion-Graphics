export function Panel({ title, children }: { title?: string; children?: React.ReactNode }) {
  return (
    <section style={{ background: '#111827', border: '1px solid #374151', borderRadius: 12, padding: 16 }}>
      {title ? <h3 style={{ marginTop: 0 }}>{title}</h3> : null}
      {children}
    </section>
  );
}
