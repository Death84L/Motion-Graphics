export function Header() {
  return (
    <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.25rem', background: '#0f172a', borderBottom: '1px solid #334155' }}>
      <strong>Motion Studio</strong>
      <div style={{ display: 'flex', gap: 8 }}>Menu</div>
    </header>
  );
}
