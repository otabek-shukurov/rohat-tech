'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  CircleUserRound,
  Heart,
  Home,
  LayoutDashboard,
  MapPin,
  Menu,
  PackageSearch,
  Search,
  ShoppingCart,
  X
} from 'lucide-react';
import { SessionUser, api, getToken } from '@/lib/api';
import { cn } from '@/lib/utils';

const navItems = [
  { label: 'Bosh sahifa', href: '/' },
  { label: 'Katalog', href: '/catalog' },
  { label: 'Aksiyalar', href: '/catalog?discount=true' },
  { label: 'Buyurtmalar', href: '/orders' }
];

const mobileItems = [
  { label: 'Asosiy', href: '/', icon: Home },
  { label: 'Katalog', href: '/catalog', icon: PackageSearch },
  { label: 'Sevimli', href: '/favorites', icon: Heart },
  { label: 'Savat', href: '/cart', icon: ShoppingCart },
  { label: 'Profil', href: '/profile', icon: CircleUserRound }
];

export function SiteHeader() {
  const pathname = usePathname();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [discountCatalog, setDiscountCatalog] = useState(false);

  useEffect(() => {
    if (!getToken()) return;
    api<SessionUser>('/auth/me').then(setUser).catch(() => setUser(null));
  }, []);

  useEffect(() => setMenuOpen(false), [pathname]);

  useEffect(() => {
    const updateLocation = () => setDiscountCatalog(pathname === '/catalog' && new URLSearchParams(window.location.search).get('discount') === 'true');
    updateLocation();
    window.addEventListener('popstate', updateLocation);
    window.addEventListener('rohat:locationchange', updateLocation);
    return () => {
      window.removeEventListener('popstate', updateLocation);
      window.removeEventListener('rohat:locationchange', updateLocation);
    };
  }, [pathname]);

  useEffect(() => {
    const updateHeader = () => {
      if (pathname !== '/') {
        setScrolled(true);
        return;
      }

      const hero = document.querySelector<HTMLElement>('[data-hero-carousel]');
      const header = document.querySelector<HTMLElement>('header');
      setScrolled(!hero || hero.getBoundingClientRect().bottom <= (header?.offsetHeight ?? 0));
    };
    updateHeader();
    window.addEventListener('scroll', updateHeader, { passive: true });
    window.addEventListener('resize', updateHeader);
    return () => {
      window.removeEventListener('scroll', updateHeader);
      window.removeEventListener('resize', updateHeader);
    };
  }, [pathname]);

  if (pathname.startsWith('/admin')) return null;

  const isHome = pathname === '/';
  const transparent = isHome && !scrolled;

  return (
    <>
      <header className={cn('top-0 z-50 border-b transition-[background-color,border-color,box-shadow] duration-300', isHome ? 'fixed inset-x-0' : 'sticky', transparent ? 'border-white/15 bg-transparent text-white' : 'border-slate-200 bg-white/95 text-slate-950 shadow-[0_8px_30px_rgba(15,23,42,0.06)] backdrop-blur-lg')}>
        <div className={cn('hidden transition-colors duration-300 md:block', transparent ? 'bg-slate-950/45 text-white/80 backdrop-blur-sm' : 'bg-slate-950 text-slate-300')}>
          <div className="mx-auto flex h-8 max-w-7xl items-center justify-between px-5 text-xs">
            <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-blue-400" /> Vobkent bo‘ylab yetkazib berish bepul</span>
            <div className="flex items-center gap-5">
              <span>Har kuni 09:00–20:00</span>
              <a href="tel:+998712000000" className="font-semibold text-white transition-colors hover:text-blue-300">+998 71 200 00 00</a>
            </div>
          </div>
        </div>

        <div className="mx-auto flex h-[68px] max-w-7xl items-center gap-4 px-4 md:h-[76px] md:px-5">
          <Link href="/" className="flex shrink-0 items-center gap-2.5" aria-label="Rohat Tech bosh sahifa">
            <span className="grid h-10 w-10 place-items-center rounded-md bg-blue-600 text-sm font-black text-white shadow-sm">RT</span>
            <span className={cn('hidden text-lg font-bold transition-colors sm:block', transparent ? 'text-white drop-shadow-sm' : 'text-slate-950')}>Rohat Tech</span>
          </Link>

          <form action="/catalog" className="relative hidden min-w-0 flex-1 md:block">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-400" />
            <input name="q" type="search" placeholder="Mahsulot yoki brendni qidiring" className={cn('h-11 w-full rounded-md pl-11 pr-24 text-sm text-slate-900 outline-none transition placeholder:text-slate-500 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100', transparent ? 'border border-white/55 bg-white/90 shadow-sm backdrop-blur' : 'border border-slate-300 bg-slate-50')} />
            <button type="submit" className="absolute right-1.5 top-1/2 h-8 -translate-y-1/2 rounded-md bg-blue-600 px-4 text-xs font-semibold text-white transition hover:bg-blue-700">Qidirish</button>
          </form>

          <div className="ml-auto flex items-center gap-1">
            {user?.role === 'ADMIN' ? (
              <Link href="/admin" className={cn('hidden h-10 items-center gap-2 rounded-md px-3 text-sm font-semibold transition lg:flex', transparent ? 'text-white hover:bg-white/15' : 'text-slate-700 hover:bg-slate-100')}><LayoutDashboard className="h-4 w-4" /> Admin</Link>
            ) : null}
            <Link href="/favorites" className={cn('hidden h-10 w-10 place-items-center rounded-md transition md:grid', transparent ? 'text-white hover:bg-white/15' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950')} aria-label="Sevimlilar" title="Sevimlilar"><Heart className="h-5 w-5" /></Link>
            <Link href="/cart" className={cn('relative grid h-10 w-10 place-items-center rounded-md transition', transparent ? 'text-white hover:bg-white/15' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950')} aria-label="Savat" title="Savat"><ShoppingCart className="h-5 w-5" /></Link>
            <Link href={user ? '/profile' : '/auth'} className={cn('hidden h-10 items-center gap-2 rounded-md border px-3 text-sm font-semibold transition sm:flex', transparent ? 'border-white/35 bg-white/10 text-white backdrop-blur hover:bg-white/20' : 'border-slate-300 bg-white text-slate-800 hover:border-slate-400 hover:bg-slate-50')}><CircleUserRound className="h-4 w-4" /> {user ? user.name.split(' ')[0] : 'Kirish'}</Link>
            <button type="button" onClick={() => setMenuOpen((open) => !open)} className={cn('grid h-10 w-10 place-items-center rounded-md transition md:hidden', transparent ? 'text-white hover:bg-white/15' : 'text-slate-700 hover:bg-slate-100')} aria-label="Menyuni ochish" aria-expanded={menuOpen}>{menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}</button>
          </div>
        </div>

        <div className={cn('border-t px-4 py-2 md:hidden', transparent ? 'border-white/15' : 'border-slate-100')}>
          <form action="/catalog" className="relative mx-auto max-w-xl">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input name="q" type="search" placeholder="Mahsulot qidirish" className={cn('h-10 w-full rounded-md pl-10 pr-3 text-sm text-slate-900 outline-none placeholder:text-slate-500 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100', transparent ? 'border border-white/55 bg-white/90 shadow-sm backdrop-blur' : 'border border-slate-300 bg-slate-50')} />
          </form>
        </div>

        <nav className={cn('hidden border-t md:block', transparent ? 'border-white/15' : 'border-slate-100')} aria-label="Asosiy navigatsiya">
          <div className="mx-auto flex h-11 max-w-7xl items-center gap-7 px-5">
            {navItems.map((item) => {
              const baseHref = item.href.split('?')[0];
              const active = item.href.includes('discount=true') ? discountCatalog : item.href === '/catalog' ? pathname.startsWith('/catalog') && !discountCatalog : item.href === '/' ? pathname === '/' : pathname.startsWith(baseHref);
              return <Link key={item.href} href={item.href} className={cn('relative flex h-full items-center text-sm font-medium transition-colors', transparent ? 'hover:text-white' : 'hover:text-blue-700', active ? (transparent ? 'text-white after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-white' : 'text-blue-700 after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-blue-600') : (transparent ? 'text-white/75' : 'text-slate-600'))}>{item.label}</Link>;
            })}
            <span className={cn('ml-auto text-xs font-medium', transparent ? 'text-emerald-200' : 'text-emerald-700')}>Rasmiy kafolat va servis</span>
          </div>
        </nav>

        {menuOpen ? (
          <nav className="border-t bg-white p-4 shadow-xl md:hidden" aria-label="Mobil menyu">
            <div className="grid gap-1">
              {navItems.map((item) => <Link key={item.href} href={item.href} className="rounded-md px-3 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-100">{item.label}</Link>)}
              <Link href={user ? '/profile' : '/auth'} className="mt-2 rounded-md bg-blue-600 px-3 py-2.5 text-center text-sm font-semibold text-white">{user ? 'Profil' : 'Tizimga kirish'}</Link>
            </div>
          </nav>
        ) : null}
      </header>

      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white/95 px-2 pb-[max(0.4rem,env(safe-area-inset-bottom))] pt-1.5 shadow-[0_-8px_30px_rgba(15,23,42,0.08)] backdrop-blur-lg md:hidden" aria-label="Mobil tezkor navigatsiya">
        <div className="mx-auto grid max-w-md grid-cols-5">
          {mobileItems.map(({ label, href, icon: Icon }) => {
            const active = href === '/' ? pathname === '/' : pathname.startsWith(href);
            return (
              <Link key={href} href={href} className={cn('flex min-w-0 flex-col items-center gap-1 rounded-md py-1 text-[10px] font-medium transition-colors', active ? 'text-blue-700' : 'text-slate-500')}>
                <Icon className="h-5 w-5" strokeWidth={active ? 2.4 : 1.8} />
                <span className="truncate">{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
