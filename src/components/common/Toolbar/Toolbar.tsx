export function Toolbar({ children }: { children?: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 8, background: '#0f172a', borderRadius: 8 }}>
      {children}
    </div>
  );
}
