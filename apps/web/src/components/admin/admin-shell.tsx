'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { type ReactNode, useEffect, useState } from 'react';
import {
  BarChart3,
  Bell,
  Boxes,
  ChevronRight,
  LayoutDashboard,
  Menu,
  Megaphone,
  Settings,
  ShoppingBag,
  Store,
  Tags,
  Users,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  {
    label: 'Asosiy',
    items: [{ label: 'Dashboard', href: '/admin', icon: LayoutDashboard }]
  },
  {
    label: 'Savdo',
    items: [
      { label: 'Buyurtmalar', href: '/admin/orders', icon: ShoppingBag },
      { label: 'Mijozlar', href: '/admin/customers', icon: Users }
    ]
  },
  {
    label: 'Katalog',
    items: [
      { label: 'Mahsulotlar', href: '/admin/products', icon: Boxes },
      { label: 'Kategoriya va brendlar', href: '/admin/dictionaries', icon: Tags },
      { label: 'Aksiyalar', href: '/admin/promotions', icon: Megaphone }
    ]
  },
  {
    label: 'Tahlil',
    items: [{ label: 'Hisobotlar', href: '/admin/reports', icon: BarChart3 }]
  }
];

const pageNames: Record<string, string> = {
  '/admin': 'Dashboard',
  '/admin/orders': 'Buyurtmalar',
  '/admin/customers': 'Mijozlar',
  '/admin/products': 'Mahsulotlar',
  '/admin/dictionaries': 'Kategoriya va brendlar',
  '/admin/promotions': 'Aksiyalar',
  '/admin/reports': 'Hisobotlar',
  '/admin/settings': 'Sozlamalar'
};

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => setMenuOpen(false), [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [menuOpen]);

  const pageName = pageNames[pathname] ?? 'Boshqaruv paneli';

  return (
    <div className="min-h-screen bg-[#f6f7f9] text-slate-950 lg:grid lg:grid-cols-[272px_minmax(0,1fr)]">
      <aside className="hidden h-screen border-r border-slate-200 bg-white lg:sticky lg:top-0 lg:flex lg:flex-col">
        <Sidebar pathname={pathname} />
      </aside>

      {menuOpen ? (
        <div className="fixed inset-0 z-[80] lg:hidden">
          <button
            type="button"
            aria-label="Menyuni yopish"
            className="absolute inset-0 bg-slate-950/45 backdrop-blur-[2px]"
            onClick={() => setMenuOpen(false)}
          />
          <aside className="relative flex h-full w-[min(86vw,320px)] flex-col bg-white shadow-2xl">
            <button
              type="button"
              aria-label="Menyuni yopish"
              title="Yopish"
              className="absolute right-3 top-3 z-10 grid h-10 w-10 place-items-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-950"
              onClick={() => setMenuOpen(false)}
            >
              <X className="h-5 w-5" />
            </button>
            <Sidebar pathname={pathname} />
          </aside>
        </div>
      ) : null}

      <div className="min-w-0">
        <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-xl">
          <div className="flex h-[68px] items-center gap-3 px-4 md:px-6 lg:px-8">
            <button
              type="button"
              aria-label="Admin menyusini ochish"
              title="Menyu"
              className="grid h-10 w-10 shrink-0 place-items-center rounded-md border border-slate-200 text-slate-700 transition hover:bg-slate-50 lg:hidden"
              onClick={() => setMenuOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
                <span>Rohat Tech</span>
                <ChevronRight className="h-3.5 w-3.5" />
                <span className="truncate text-slate-600">{pageName}</span>
              </div>
              <p className="mt-0.5 truncate text-sm font-semibold text-slate-950">{pageName}</p>
            </div>

            <span className="hidden items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 sm:inline-flex">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
              Demo rejim
            </span>

            <button
              type="button"
              aria-label="Bildirishnomalar"
              title="Bildirishnomalar"
              className="relative grid h-10 w-10 shrink-0 place-items-center rounded-md border border-slate-200 text-slate-600 transition hover:bg-slate-50 hover:text-slate-950"
            >
              <Bell className="h-[18px] w-[18px]" />
              <span className="absolute right-2.5 top-2.5 h-1.5 w-1.5 rounded-full bg-rose-500 ring-2 ring-white" />
            </button>

            <div className="flex items-center gap-2 border-l border-slate-200 pl-3">
              <span className="grid h-9 w-9 place-items-center rounded-md bg-slate-950 text-xs font-bold text-white">AS</span>
              <div className="hidden leading-tight md:block">
                <p className="text-xs font-semibold text-slate-900">Administrator</p>
                <p className="mt-0.5 text-[11px] text-slate-500">To‘liq kirish</p>
              </div>
            </div>
          </div>
        </header>

        <main>{children}</main>
      </div>
    </div>
  );
}

function Sidebar({ pathname }: { pathname: string }) {
  return (
    <>
      <Link href="/admin" className="flex h-[76px] items-center gap-3 border-b border-slate-200 px-5">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-blue-600 text-sm font-black text-white shadow-sm">RT</span>
        <span className="min-w-0">
          <span className="block text-sm font-bold text-slate-950">Rohat Tech</span>
          <span className="mt-0.5 block text-xs text-slate-500">Boshqaruv paneli</span>
        </span>
      </Link>

      <nav className="flex-1 overflow-y-auto px-3 py-5" aria-label="Admin navigatsiya">
        {navigation.map((group) => (
          <div key={group.label} className="mb-6 last:mb-0">
            <p className="mb-2 px-3 text-[11px] font-bold uppercase text-slate-400">{group.label}</p>
            <div className="space-y-1">
              {group.items.map(({ label, href, icon: Icon }) => {
                const active = href === '/admin' ? pathname === href : pathname.startsWith(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      'flex min-h-11 items-center gap-3 rounded-md px-3 text-sm font-semibold transition-colors',
                      active ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
                    )}
                  >
                    <Icon className="h-[18px] w-[18px] shrink-0" />
                    <span className="truncate">{label}</span>
                    {href === '/admin/orders' ? (
                      <span className={cn('ml-auto rounded-full px-2 py-0.5 text-[10px] font-bold', active ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-700')}>5</span>
                    ) : null}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="space-y-1 border-t border-slate-200 p-3">
        <Link href="/admin/settings" className={cn('flex min-h-11 items-center gap-3 rounded-md px-3 text-sm font-semibold transition-colors', pathname.startsWith('/admin/settings') ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950')}>
          <Settings className="h-[18px] w-[18px]" />
          Sozlamalar
        </Link>
        <Link href="/" className="flex min-h-11 items-center gap-3 rounded-md px-3 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-950">
          <Store className="h-[18px] w-[18px]" />
          Magazin sahifasi
        </Link>
      </div>
    </>
  );
}
