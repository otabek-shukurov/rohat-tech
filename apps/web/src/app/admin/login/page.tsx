'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, LockKeyhole, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api, setToken, type SessionUser } from '@/lib/api';

type LoginResponse = { token: string; user: SessionUser };

export default function AdminLoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError('');
    const form = new FormData(event.currentTarget);
    try {
      const result = await api<LoginResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: form.get('email'), password: form.get('password') })
      });
      if (result.user.role !== 'ADMIN') throw new Error('Bu hisob admin panelga kira olmaydi');
      setToken(result.token);
      router.replace('/admin');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Kirishda xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[#f4f6f9] px-4 py-10">
      <section className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-[0_24px_70px_rgba(15,23,42,0.10)] sm:p-8">
        <div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-md bg-blue-600 text-sm font-black text-white">RT</span><div><p className="text-lg font-bold text-slate-950">Rohat Tech</p><p className="text-xs text-slate-500">Boshqaruv paneli</p></div></div>
        <div className="mt-8"><h1 className="text-2xl font-bold text-slate-950">Admin sifatida kirish</h1><p className="mt-2 text-sm leading-6 text-slate-500">Mahsulotlar, buyurtmalar va sotuvlarni boshqarish.</p></div>
        <form onSubmit={login} className="mt-6 space-y-4">
          <label className="block"><span className="mb-2 block text-sm font-semibold text-slate-700">Email</span><span className="relative block"><Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><Input name="email" type="email" autoComplete="username" required className="h-11 pl-10" placeholder="admin@rohat.tech" /></span></label>
          <label className="block"><span className="mb-2 block text-sm font-semibold text-slate-700">Parol</span><span className="relative block"><LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><Input name="password" type="password" autoComplete="current-password" required minLength={8} className="h-11 pl-10" /></span></label>
          {error ? <p className="rounded-md bg-rose-50 px-3 py-2.5 text-sm text-rose-700" role="alert">{error}</p> : null}
          <Button className="h-11 w-full" disabled={loading}>{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}{loading ? 'Kirilmoqda...' : 'Kirish'}</Button>
        </form>
      </section>
    </main>
  );
}
