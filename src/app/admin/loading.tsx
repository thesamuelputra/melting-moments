export default function AdminLoading() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '50vh',
      gap: '0.75rem',
    }}>
      <div style={{
        width: '20px',
        height: '20px',
        border: '2px solid rgba(0,0,0,0.1)',
        borderTopColor: '#111',
        borderRadius: '50%',
        animation: 'admin-spin 0.6s linear infinite',
      }} />
      <span style={{ fontSize: '0.85rem', color: '#6B7280' }}>Loading…</span>
      <style>{`@keyframes admin-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
