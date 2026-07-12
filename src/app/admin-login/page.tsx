'use client';

import { useState } from 'react';
import { unstable_rethrow } from 'next/navigation';
import { login } from './actions';

export default function AdminLogin() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    try {
      const result = await login(formData); // redirects on success
      if (result?.error) {
        setError(result.error);
      }
    } catch (err) {
      // redirect() rejects with an internal NEXT_REDIRECT error that Next
      // must handle; rethrow it so only real failures reach the fallback.
      unstable_rethrow(err);
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100dvh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'var(--clr-ink)',
      color: 'var(--clr-oat)',
      padding: '2rem'
    }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2rem, 5vw, 3rem)', letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>Melting Moments</div>
          <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.15em', opacity: 0.4 }}>Catering Victoria BC</div>
          <div style={{ width: '40px', height: '1px', backgroundColor: 'rgba(255,255,255,0.2)', margin: '1.5rem auto' }} />
          <h1 className="noire-serif" style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>Admin Console</h1>
          <p style={{ opacity: 0.5, fontSize: '0.8rem' }}>Restricted Access Area</p>
        </div>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <label htmlFor="admin-password" style={{ display: 'block', fontSize: '0.8rem', opacity: 0.8, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Master Password</label>
            <input
              id="admin-password"
              name="password"
              type="password"
              required
              autoFocus
              style={{
                width: '100%',
                padding: '1rem',
                backgroundColor: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: 'white',
                fontFamily: 'inherit',
                fontSize: '1rem'
              }}
            />
          </div>
          
          {error && <div role="alert" style={{ color: '#F87171', fontSize: '0.85rem' }}>{error}</div>}
          
          <button 
            type="submit" 
            disabled={loading}
            style={{
              width: '100%',
              padding: '1rem',
              backgroundColor: 'var(--clr-oat)',
              color: 'var(--clr-ink)',
              border: 'none',
              fontWeight: 500,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              transition: 'opacity 0.2s'
            }}
          >
            {loading ? 'Authenticating…' : 'Enter Console'}
          </button>
        </form>
      </div>
    </div>
  );
}
