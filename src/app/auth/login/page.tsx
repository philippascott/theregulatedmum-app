'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('🔐 Attempting login with:', email);

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log('Auth result:', { data, signInError });

      if (signInError) {
        console.error('❌ Auth error:', signInError.message);
        setError(signInError.message);
        setLoading(false);
        return;
      }

      console.log('✅ Auth successful, checking subscription...');

      const { data: subscription, error: subError } = await supabase
        .from('GHL_Subscription')
        .select('*')
        .eq('email', email);

      console.log('Subscription query result:', { subscription, subError });

      if (subError) {
        console.error('❌ Query error:', subError);
        setError('Database error. Please try again.');
        setLoading(false);
        return;
      }

      if (!subscription || subscription.length === 0) {
        console.error('❌ No subscription found for:', email);
        setError('No subscription found. Please upgrade to access the chatbot.');
        setLoading(false);
        return;
      }

      const activeSubscription = subscription.find(
        (s: any) => s.subscription_status === 'active' || s.subscription_status === 'trialing'
      );

      console.log('Active subscription:', activeSubscription);

      if (!activeSubscription) {
        console.error('❌ No active/trialing subscription found');
        setError('No active subscription found. Please upgrade to access the chatbot.');
        setLoading(false);
        return;
      }

      console.log('✅ All checks passed, redirecting to chat');
      router.push('/chat');
    } catch (err) {
      console.error('❌ Unexpected error:', err);
      setError('An error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#F5EDE4', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: '400px', padding: '2rem', backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '600', marginBottom: '1.5rem', color: '#333', fontFamily: 'Public Sans, sans-serif' }}>
          Regulated Mum
        </h1>
        <p style={{ color: '#666', marginBottom: '2rem', fontFamily: 'Public Sans, sans-serif' }}>Sign in to access your chatbot</p>

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
            <div style={{ color: '#D9A9A0', marginBottom: '1rem', fontSize: '14px', fontFamily: 'Public Sans, sans-serif' }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
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
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p style={{ marginTop: '1.5rem', fontSize: '14px', color: '#666', fontFamily: 'Public Sans, sans-serif' }}>
          Don't have an account? Contact support to sign up.
        </p>
      </div>
    </div>
  );
}
