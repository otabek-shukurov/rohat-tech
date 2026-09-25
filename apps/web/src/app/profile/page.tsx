'use client';

import Link from 'next/link';
import { LogOut, Mail, Package, Phone, UserRound } from 'lucide-react';
import { useEffect, useState } from 'react';
import { PageHeading } from '@/components/page-heading';
import { Button } from '@/components/ui/button';
import { SessionUser, api } from '@/lib/api';

export default function ProfilePage() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { api<SessionUser>('/auth/me').then(setUser).catch(() => setUser(null)).finally(() => setLoading(false)); }, []);

  function logout() { localStorage.removeItem('rohat_token'); window.location.href = '/'; }

  return (
    <div className="min-h-[60vh] bg-slate-50">
      <PageHeading title="Profil" description="Shaxsiy ma’lumotlar va buyurtmalarni boshqaring." />
      <div className="mx-auto max-w-4xl px-4 py-8 md:px-5">
        {loading ? <div className="skeleton-pulse h-64 rounded-lg border bg-white" /> : user ? (
          <div className="grid gap-6 md:grid-cols-[220px_1fr]">
            <aside className="h-fit rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <span className="grid h-12 w-12 place-items-center rounded-lg bg-blue-50 text-blue-700"><UserRound className="h-6 w-6" /></span>
              <h2 className="mt-4 font-semibold text-slate-950">{user.name}</h2><p className="mt-1 text-xs text-slate-500">{user.role === 'ADMIN' ? 'Administrator' : 'Mijoz'}</p>
              <Button asChild variant="outline" className="mt-5 w-full"><Link href="/orders"><Package className="h-4 w-4" /> Buyurtmalar</Link></Button>
            </aside>
            <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="text-lg font-semibold text-slate-950">Shaxsiy ma’lumotlar</h2>
              <div className="mt-5 divide-y divide-slate-200">
                <ProfileRow icon={UserRound} label="Ism va familiya" value={user.name} />
                <ProfileRow icon={Mail} label="Email" value={user.email} />
                <ProfileRow icon={Phone} label="Telefon" value={user.phone || 'Kiritilmagan'} />
              </div>
              <div className="mt-6 border-t border-slate-200 pt-5"><Button variant="outline" onClick={logout} className="text-red-700 hover:border-red-200 hover:bg-red-50"><LogOut className="h-4 w-4" /> Tizimdan chiqish</Button></div>
            </section>
          </div>
        ) : (
          <div className="rounded-lg border border-slate-200 bg-white px-6 py-12 text-center"><UserRound className="mx-auto h-8 w-8 text-slate-400" /><h2 className="mt-3 text-lg font-semibold">Profilga kiring</h2><p className="mt-1 text-sm text-slate-500">Shaxsiy ma’lumotlar va buyurtmalarni ko‘rish uchun tizimga kiring.</p><Button asChild className="mt-5"><Link href="/auth">Tizimga kirish</Link></Button></div>
        )}
      </div>
    </div>
  );
}

function ProfileRow({ icon: Icon, label, value }: { icon: typeof UserRound; label: string; value: string }) {
  return <div className="flex items-center gap-4 py-4 first:pt-0"><Icon className="h-5 w-5 text-slate-400" /><div><p className="text-xs text-slate-500">{label}</p><p className="mt-0.5 text-sm font-semibold text-slate-900">{value}</p></div></div>;
}
