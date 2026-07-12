export default function AdminLoading() {
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '50vh',
        gap: '0.75rem',
      }}
    >
      <div
        className="admin-loading-spinner"
        aria-hidden="true"
        style={{
          width: '20px',
          height: '20px',
          border: '2px solid rgba(0,0,0,0.1)',
          borderTopColor: 'var(--clr-ink)',
          borderRadius: '50%',
          animation: 'admin-spin 0.6s linear infinite',
        }}
      />
      <span style={{ fontSize: '0.85rem', color: 'var(--clr-charcoal)', opacity: 0.6 }}>Loading…</span>
      <style>{`
        @keyframes admin-spin { to { transform: rotate(360deg); } }
        @media (prefers-reduced-motion: reduce) {
          .admin-loading-spinner { animation: none !important; }
        }
      `}</style>
    </div>
  );
}
