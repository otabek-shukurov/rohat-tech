'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { Headphones, ShieldCheck, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api, setToken } from '@/lib/api';
import { cn } from '@/lib/utils';

type AuthResponse = { token: string; user: { role: 'ADMIN' | 'CUSTOMER' } };

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    const form = new FormData(event.currentTarget);
    try {
      const session = await api<AuthResponse>(`/auth/${mode}`, { method: 'POST', body: JSON.stringify(Object.fromEntries(form.entries())) });
      setToken(session.token);
      router.push(session.user.role === 'ADMIN' ? '/admin' : '/catalog');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Xatolik yuz berdi');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="bg-slate-50 px-4 py-10 md:px-5 md:py-16">
      <div className="mx-auto grid max-w-5xl overflow-hidden rounded-lg border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)] md:grid-cols-[0.9fr_1.1fr]">
        <aside className="bg-slate-950 p-7 text-white md:p-10">
          <Link href="/" className="inline-flex items-center gap-2.5 text-lg font-bold"><span className="grid h-10 w-10 place-items-center rounded-md bg-blue-600 text-sm font-black">RT</span> Rohat Tech</Link>
          <h1 className="mt-10 text-3xl font-bold leading-tight">Xaridlaringizni bitta profilda boshqaring</h1>
          <p className="mt-4 text-sm leading-6 text-slate-400">Buyurtma holatini kuzating, sevimli mahsulotlarni saqlang va keyingi xaridni tezroq yakunlang.</p>
          <div className="mt-9 space-y-5">
            {[{ icon: Truck, text: 'Yetkazib berish holatini kuzatish' }, { icon: ShieldCheck, text: 'Buyurtmalar va kafolat tarixi' }, { icon: Headphones, text: 'Servis bilan tez bog‘lanish' }].map(({ icon: Icon, text }) => <div key={text} className="flex items-center gap-3 text-sm text-slate-300"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-white/10 text-blue-300"><Icon className="h-4 w-4" /></span>{text}</div>)}
          </div>
        </aside>

        <section className="p-6 sm:p-8 md:p-10">
          <div className="grid grid-cols-2 rounded-md bg-slate-100 p-1" role="tablist" aria-label="Kirish turi">
            <button type="button" onClick={() => setMode('login')} className={cn('h-10 rounded-md text-sm font-semibold transition', mode === 'login' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500 hover:text-slate-800')}>Kirish</button>
            <button type="button" onClick={() => setMode('register')} className={cn('h-10 rounded-md text-sm font-semibold transition', mode === 'register' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500 hover:text-slate-800')}>Ro‘yxatdan o‘tish</button>
          </div>
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-slate-950">{mode === 'login' ? 'Xush kelibsiz' : 'Yangi profil yarating'}</h2>
            <p className="mt-2 text-sm text-slate-500">{mode === 'login' ? 'Profilingizga kirish uchun ma’lumotlarni kiriting.' : 'Buyurtmalarni boshqarish uchun ma’lumotlarni to‘ldiring.'}</p>
          </div>
          <form onSubmit={submit} className="mt-7 space-y-4">
            {mode === 'register' ? <Field label="Ism va familiya"><Input name="name" autoComplete="name" placeholder="Ism familiya" required /></Field> : null}
            <Field label="Email"><Input name="email" type="email" autoComplete="email" placeholder="email@example.com" required /></Field>
            {mode === 'register' ? <Field label="Telefon"><Input name="phone" autoComplete="tel" placeholder="+998 90 123 45 67" /></Field> : null}
            <Field label="Parol"><Input name="password" type="password" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} placeholder="Kamida 8 ta belgi" required /></Field>
            {error ? <p className="rounded-md bg-red-50 px-3 py-2.5 text-sm text-red-700" role="alert">{error}</p> : null}
            <Button className="w-full" disabled={submitting}>{submitting ? 'Kutilmoqda...' : mode === 'login' ? 'Tizimga kirish' : 'Profil yaratish'}</Button>
          </form>
        </section>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-2 block text-sm font-semibold text-slate-800">{label}</span>{children}</label>;
}
