type ButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
};

export function Button({ children, onClick }: ButtonProps) {
  return (
    <button onClick={onClick} style={{ padding: '0.5rem 0.9rem', borderRadius: 8, border: '1px solid #334155', background: '#1e293b', color: '#f8fafc' }}>
      {children}
    </button>
  );
}
