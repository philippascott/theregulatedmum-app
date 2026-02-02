export const dynamic = 'force-dynamic';

'use client';

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
        setLoading(fa
