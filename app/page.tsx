'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redirecionar para o dashboard
    router.push('/dashboard');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50">
      <div className="text-center">
        <div className="inline-block p-4 rounded-full bg-purple-100 mb-4">
          <div className="w-10 h-10 rounded-full bg-purple-700 animate-pulse"></div>
        </div>
        <h1 className="text-xl font-medium text-slate-700">Carregando...</h1>
        <p className="text-slate-500 mt-2">Redirecionando para o dashboard</p>
      </div>
    </div>
  );
} 