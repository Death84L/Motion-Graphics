type IconButtonProps = {
  label: string;
  onClick?: () => void;
};

export function IconButton({ label, onClick }: IconButtonProps) {
  return (
    <button
      aria-label={label}
      onClick={onClick}
      style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #334155', background: '#0f172a', color: '#f8fafc' }}
    >
      {label.charAt(0).toUpperCase()}
    </button>
  );
}
