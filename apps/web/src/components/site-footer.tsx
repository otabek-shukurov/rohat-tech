'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Mail, MapPin, Phone, ShieldCheck, Truck } from 'lucide-react';

const shopLinks = [
  ['Katalog', '/catalog'],
  ['Aksiyalar', '/catalog?discount=true'],
  ['Sevimlilar', '/favorites'],
  ['Savat', '/cart']
];

const customerLinks = [
  ['Buyurtmalarim', '/orders'],
  ['Profil', '/profile'],
  ['Yetkazib berish', '/checkout'],
  ['Tizimga kirish', '/auth']
];

export function SiteFooter() {
  const pathname = usePathname();
  if (pathname.startsWith('/admin')) return null;

  return (
    <footer className="border-t border-slate-800 bg-slate-950 pb-16 text-slate-300 md:pb-0">
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-5 md:py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.3fr_0.7fr_0.8fr_1fr]">
          <div>
            <Link href="/" className="inline-flex items-center gap-2.5 text-lg font-bold text-white"><span className="grid h-10 w-10 place-items-center rounded-md bg-blue-600 text-sm font-black">RT</span>Rohat Tech</Link>
            <p className="mt-4 max-w-sm text-sm leading-6 text-slate-400">Uy uchun texnikani tushunarli tanlash, ishonchli xarid qilish va qulay yetkazib olish uchun zamonaviy savdo platformasi.</p>
            <div className="mt-5 flex gap-5 text-xs text-slate-400">
              <span className="flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-emerald-400" /> Rasmiy kafolat</span>
              <span className="flex items-center gap-1.5"><Truck className="h-4 w-4 text-blue-400" /> Tez yetkazish</span>
            </div>
          </div>
          <FooterLinks title="Xarid" items={shopLinks} />
          <FooterLinks title="Mijozlar uchun" items={customerLinks} />
          <div>
            <h2 className="text-sm font-semibold text-white">Bog‘lanish</h2>
            <div className="mt-4 space-y-3 text-sm text-slate-400">
              <a href="tel:+998712000000" className="flex items-center gap-2.5 transition hover:text-white"><Phone className="h-4 w-4 text-blue-400" /> +998 71 200 00 00</a>
              <a href="mailto:hello@rohattech.uz" className="flex items-center gap-2.5 transition hover:text-white"><Mail className="h-4 w-4 text-blue-400" /> hello@rohattech.uz</a>
              <p className="flex items-start gap-2.5"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-blue-400" /> Vobkent tumani, Buxoro</p>
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-slate-800">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-5 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between md:px-5">
          <span>© 2026 Rohat Tech. Barcha huquqlar himoyalangan.</span>
          <div className="flex gap-5"><Link href="/profile" className="hover:text-slate-300">Maxfiylik</Link><Link href="/orders" className="hover:text-slate-300">Foydalanish shartlari</Link></div>
        </div>
      </div>
    </footer>
  );
}

function FooterLinks({ title, items }: { title: string; items: string[][] }) {
  return (
    <div>
      <h2 className="text-sm font-semibold text-white">{title}</h2>
      <ul className="mt-4 space-y-3 text-sm text-slate-400">
        {items.map(([label, href]) => <li key={href}><Link className="transition hover:text-white" href={href}>{label}</Link></li>)}
      </ul>
    </div>
  );
}
