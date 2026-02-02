'use client';

import { useState } from 'react';

export default function LoginPage() {
  const [email, setEmail] = useState('pippa.fantasticfutures@gmail.com');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🔐 Form submitted!');
    setError('Test message');
  };

  console.log('✅ Login page rendered');

  return (
    <div style={{ backgroundColor: '#F5EDE4', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: '400px', padding: '2rem', backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '600', marginBottom: '1.5rem', color: '#333', fontFamily: 'Public Sans, sans-serif' }}>
          Regulated Mum
        </h1>

        <form onSubmit={handleLogin}>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              marginBottom: '1rem',
              border: '1px solid #ddd',
              borderRadius: '8px',
              fontFamily: 'Public Sans, sans-serif',
              fontSize: '14px',
              boxSizing: 'border-box',
            }}
            required
          />

          <input
            type="password"
            id="password"
            name="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              marginBottom: '1.5rem',
              border: '1px solid #ddd',
              borderRadius: '8px',
              fontFamily: 'Public Sans, sans-serif',
              fontSize: '14px',
              boxSizing: 'border-box',
            }}
            required
          />

          {error && (
            <div style={{ color: '#D9A9A0', marginBottom: '1rem', fontSize: '14px' }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#9EB79A',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontFamily: 'Public Sans, sans-serif',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}
