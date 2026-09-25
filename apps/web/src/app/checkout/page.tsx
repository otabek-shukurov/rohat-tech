'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, PackageCheck, Store, Truck } from 'lucide-react';
import { PageHeading } from '@/components/page-heading';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';

export default function CheckoutPage() {
  const router = useRouter();
  const [method, setMethod] = useState<'DELIVERY' | 'PICKUP'>('DELIVERY');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    const form = new FormData(event.currentTarget);
    try {
      await api('/orders', { method: 'POST', body: JSON.stringify({ deliveryMethod: method, deliveryAddress: form.get('deliveryAddress'), customerNote: form.get('customerNote') }) });
      router.push('/orders');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Buyurtma yaratilmadi');
    } finally { setSubmitting(false); }
  }

  return (
    <div className="min-h-[60vh] bg-slate-50">
      <PageHeading title="Buyurtmani rasmiylashtirish" description="Qabul qilish usuli va bog‘lanish ma’lumotlarini tasdiqlang." />
      <form onSubmit={submit} className="mx-auto grid max-w-5xl gap-6 px-4 py-8 md:px-5 lg:grid-cols-[1fr_320px]">
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-lg font-semibold text-slate-950">Qabul qilish usuli</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <MethodButton active={method === 'DELIVERY'} onClick={() => setMethod('DELIVERY')} icon={Truck} title="Yetkazib berish" text="Ko‘rsatilgan manzilga" />
            <MethodButton active={method === 'PICKUP'} onClick={() => setMethod('PICKUP')} icon={Store} title="Magazindan olish" text="Tayyor bo‘lganda olib ketish" />
          </div>
          <div className="mt-7 border-t border-slate-200 pt-6">
            <h2 className="text-lg font-semibold text-slate-950">Buyurtma ma’lumotlari</h2>
            <div className="mt-4 space-y-4">
              {method === 'DELIVERY' ? <label className="block"><span className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-800"><MapPin className="h-4 w-4 text-blue-600" /> Yetkazib berish manzili</span><Input name="deliveryAddress" placeholder="Shahar, ko‘cha, uy va xonadon" required /></label> : null}
              <label className="block"><span className="mb-2 block text-sm font-semibold text-slate-800">Buyurtmaga izoh</span><textarea name="customerNote" rows={4} placeholder="Masalan: yetkazishdan oldin qo‘ng‘iroq qiling" className="w-full resize-none rounded-md border border-slate-300 bg-white px-3.5 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" /></label>
            </div>
          </div>
        </section>
        <aside className="h-fit rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-slate-950">Yakunlash</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">Buyurtma tasdiqlangach operatorimiz tafsilotlarni aniqlashtirish uchun bog‘lanadi.</p>
          <div className="mt-5 flex items-start gap-3 rounded-md bg-emerald-50 p-3 text-sm text-emerald-800"><PackageCheck className="mt-0.5 h-5 w-5 shrink-0" /><span>Mahsulot jo‘natishdan oldin tekshiriladi.</span></div>
          {error ? <p className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700" role="alert">{error}</p> : null}
          <Button className="mt-5 w-full" disabled={submitting}>{submitting ? 'Rasmiylashtirilmoqda...' : 'Buyurtmani tasdiqlash'}</Button>
        </aside>
      </form>
    </div>
  );
}

function MethodButton({ active, onClick, icon: Icon, title, text }: { active: boolean; onClick: () => void; icon: typeof Truck; title: string; text: string }) {
  return <button type="button" onClick={onClick} className={cn('flex items-start gap-3 rounded-lg border p-4 text-left transition', active ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-100' : 'border-slate-200 bg-white hover:border-slate-400')}><span className={cn('grid h-9 w-9 shrink-0 place-items-center rounded-md', active ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600')}><Icon className="h-4 w-4" /></span><span><strong className="block text-sm text-slate-950">{title}</strong><span className="mt-1 block text-xs text-slate-500">{text}</span></span></button>;
}
