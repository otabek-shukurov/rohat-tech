'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { type ReactNode } from 'react';
import { BarChart3, Boxes, LayoutDashboard, Megaphone, Package, Settings, ShoppingBag, Store, Tags, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

const items = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Mahsulotlar', href: '/admin/products', icon: Boxes },
  { label: 'Buyurtmalar', href: '/admin/orders', icon: ShoppingBag },
  { label: 'Mijozlar', href: '/admin/customers', icon: Users },
  { label: 'Kategoriya va brendlar', href: '/admin/dictionaries', icon: Tags },
  { label: 'Aksiyalar', href: '/admin/promotions', icon: Megaphone },
  { label: 'Hisobotlar', href: '/admin/reports', icon: BarChart3 },
  { label: 'Sozlamalar', href: '/admin/settings', icon: Settings }
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="min-h-screen bg-slate-100 lg:grid lg:grid-cols-[260px_minmax(0,1fr)]">
      <aside className="hidden h-screen border-r border-slate-800 bg-slate-950 text-slate-300 lg:sticky lg:top-0 lg:flex lg:flex-col">
        <Link href="/admin" className="flex h-20 items-center gap-3 border-b border-slate-800 px-6 text-lg font-bold text-white"><span className="grid h-10 w-10 place-items-center rounded-md bg-blue-600 text-sm font-black">RT</span><span>Rohat Admin</span></Link>
        <nav className="flex-1 space-y-1 overflow-y-auto p-4" aria-label="Admin navigatsiya">
          {items.map(({ label, href, icon: Icon }) => {
            const active = href === '/admin' ? pathname === href : pathname.startsWith(href);
            return <Link key={href} href={href} className={cn('flex min-h-11 items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors', active ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-900 hover:text-white')}><Icon className="h-[18px] w-[18px]" />{label}</Link>;
          })}
        </nav>
        <div className="border-t border-slate-800 p-4"><Link href="/" className="flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium text-slate-400 transition hover:bg-slate-900 hover:text-white"><Store className="h-[18px] w-[18px]" /> Magazin sahifasi</Link></div>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-lg">
          <div className="flex h-16 items-center justify-between px-4 md:px-6 lg:px-8">
            <Link href="/admin" className="flex items-center gap-2 font-bold text-slate-950 lg:hidden"><span className="grid h-9 w-9 place-items-center rounded-md bg-blue-600 text-xs font-black text-white">RT</span> Admin</Link>
            <div className="hidden lg:block"><p className="text-sm font-semibold text-slate-950">Boshqaruv paneli</p><p className="text-xs text-slate-500">Rohat Tech</p></div>
            <div className="flex items-center gap-3"><span className="hidden text-right sm:block"><span className="block text-sm font-semibold text-slate-900">Administrator</span><span className="block text-xs text-slate-500">To‘liq kirish</span></span><span className="grid h-9 w-9 place-items-center rounded-md bg-slate-100 text-sm font-bold text-slate-700">A</span></div>
          </div>
          <nav className="flex gap-1 overflow-x-auto border-t border-slate-100 px-3 py-2 lg:hidden" aria-label="Admin mobil navigatsiya">
            {items.slice(0, 6).map(({ label, href, icon: Icon }) => {
              const active = href === '/admin' ? pathname === href : pathname.startsWith(href);
              return <Link key={href} href={href} className={cn('flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-xs font-semibold', active ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-100')}><Icon className="h-4 w-4" />{label}</Link>;
            })}
          </nav>
        </header>
        <div>{children}</div>
      </div>
    </div>
  );
}
