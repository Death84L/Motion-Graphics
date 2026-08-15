export function Sidebar() {
  return (
    <aside style={{ width: 240, background: '#111827', borderRight: '1px solid #334155', padding: 16 }}>
      <h4 style={{ marginTop: 0 }}>Explorer</h4>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 8 }}>
        <li>Timeline</li>
        <li>Properties</li>
        <li>Assets</li>
      </ul>
    </aside>
  );
}
