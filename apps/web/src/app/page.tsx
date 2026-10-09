'use client';

import Image from 'next/image';
import Link from 'next/link';
import { type CSSProperties, useEffect, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  Plus,
  RefreshCw,
  ShoppingBag
} from 'lucide-react';
import { BrandMarquee } from '@/components/brand-marquee';
import { ProductCard } from '@/components/product-card';
import { ScrollReveal } from '@/components/scroll-reveal';
import { Button } from '@/components/ui/button';
import { Product, api, isDemoMode } from '@/lib/api';
import { demoCatalogMeta, demoCategoryVisuals, demoProducts } from '@/lib/demo-catalog';
import { cn } from '@/lib/utils';

const heroSlides = [
  { image: '/images/rohat-tech-hero.png', mobileImage: '/images/mobile-hero-appliances.png', label: 'Uy uchun to‘liq yechim', title: 'Yangi avlod maishiy texnikasi', position: 'center', motion: 'hero-media--right' },
  { image: '/images/hero-tv.png', mobileImage: '/images/mobile-hero-tv.png', label: 'Katta ekranlar', title: 'Kino kayfiyati endi uyda', position: 'center', motion: 'hero-media--left' },
  { image: '/images/hero-fridge.png', mobileImage: '/images/mobile-hero-fridge.png', label: 'Oshxona uchun', title: 'Har kuni yangi va qulay', position: 'center', motion: 'hero-media--right' },
  { image: '/images/hero-washer.png', mobileImage: '/images/mobile-hero-washer.png', label: 'Kundalik yordamchi', title: 'Tozalik kamroq vaqt talab qiladi', position: 'center', motion: 'hero-media--left' }
];

const categoryCaptions: Record<string, string> = {
  sovutgichlar: 'Oshxona uchun',
  'kir-yuvish-mashinalari': 'Kundalik qulaylik',
  televizorlar: 'Tiniq tasvir',
  konditsionerlar: 'Har faslda komfort',
  changyutgichlar: 'Toza uy uchun',
  blenderlar: 'Tez va mazali',
  'elektr-choynaklar': 'Har kuni issiq ichimlik',
  kulerlar: 'Toza va salqin suv',
  noutbuklar: 'Ish va ta’lim uchun',
  dazmollar: 'Saranjom kiyimlar',
  'gaz-plitalar': 'Qulay taom tayyorlash',
  'mikrotolqinli-pechlar': 'Tez isitish',
  'oshxona-jihozlari': 'Ko‘proq imkoniyat',
  'boshqa-texnika': 'Uy uchun foydali'
};

const categories = demoCatalogMeta.categories.map((category) => ({
  ...category,
  caption: categoryCaptions[category.slug],
  image: demoCategoryVisuals[category.slug]
}));

const INITIAL_PRODUCT_COUNT = 20;
const LOAD_MORE_COUNT = 20;

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>(isDemoMode ? demoProducts : []);
  const [loading, setLoading] = useState(!isDemoMode);
  const [loadError, setLoadError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const [activeSlide, setActiveSlide] = useState(0);
  const [visibleCount, setVisibleCount] = useState(INITIAL_PRODUCT_COUNT);

  useEffect(() => {
    if (isDemoMode) return;

    setLoading(true);
    setLoadError('');
    api<Product[]>('/products')
      .then(setProducts)
      .catch(() => {
        setProducts([]);
        setLoadError('Server uyg‘onishi biroz vaqt olishi mumkin. Qayta urinib ko‘ring.');
      })
      .finally(() => setLoading(false));
  }, [reloadKey]);

  useEffect(() => {
    const timer = window.setInterval(() => setActiveSlide((current) => (current + 1) % heroSlides.length), 6500);
    return () => window.clearInterval(timer);
  }, []);

  function changeSlide(direction: number) {
    setActiveSlide((current) => (current + direction + heroSlides.length) % heroSlides.length);
  }

  const activeHero = heroSlides[activeSlide];
  const visibleProducts = products.slice(0, visibleCount);
  const remainingProducts = Math.max(0, products.length - visibleProducts.length);

  return (
    <div className="overflow-x-clip bg-white">
      <section data-hero-carousel className="relative h-[100svh] min-h-[620px] max-h-[920px] w-full overflow-hidden bg-slate-100 sm:min-h-[680px] lg:min-h-[720px] lg:max-h-none" aria-roledescription="carousel" aria-label="Rohat Tech takliflari">
        {heroSlides.map((slide, index) => (
          <div key={slide.image} className={cn('absolute inset-0 transition-[opacity,transform] duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)]', index === activeSlide ? 'scale-100 opacity-100' : 'pointer-events-none scale-[1.015] opacity-0')} aria-hidden={index !== activeSlide}>
            <Image
              src={slide.mobileImage}
              alt=""
              fill
              priority={index === 0}
              sizes="100vw"
              className={cn('hero-mobile-media object-cover md:hidden', index === activeSlide && `hero-media--active ${slide.motion}`)}
            />
            <Image
              src={slide.image}
              alt=""
              fill
              priority={index === 0}
              sizes="100vw"
              className={cn('hero-media hidden object-cover md:block', index === activeSlide && `hero-media--active ${slide.motion}`)}
              style={{ '--hero-position': slide.position } as CSSProperties}
            />
          </div>
        ))}

        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(2,6,23,0.58)_0%,rgba(2,6,23,0.14)_29%,rgba(2,6,23,0.12)_48%,rgba(2,6,23,0.78)_100%)]" />

        <div className="pointer-events-none absolute inset-x-0 bottom-36 z-10 mx-auto max-w-7xl px-4 sm:bottom-20 sm:px-6 lg:bottom-20">
          <div key={activeHero.title} className="max-w-[19rem] text-white motion-safe:animate-[fade-in_.65s_ease-out] sm:max-w-2xl">
            <p className="text-[11px] font-semibold uppercase tracking-normal text-white/75 sm:text-xs">{activeHero.label}</p>
            <h1 className="mt-2 text-2xl font-semibold leading-[1.12] sm:mt-3 sm:text-4xl lg:max-w-3xl lg:text-5xl">{activeHero.title}</h1>
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-24 z-20 flex items-center justify-center gap-2 px-4 sm:bottom-6">
          {heroSlides.map((slide, index) => (
            <button key={slide.title} type="button" onClick={() => setActiveSlide(index)} className={cn('relative h-1.5 overflow-hidden rounded-full bg-white/55 shadow-sm transition-all duration-300', index === activeSlide ? 'w-14 sm:w-20' : 'w-6 hover:bg-white/80')} aria-label={`${index + 1}-slayd`} aria-current={index === activeSlide ? 'true' : undefined}>
              {index === activeSlide ? <span className="absolute inset-y-0 left-0 w-full origin-left bg-white motion-safe:animate-[progress_6.5s_linear]" /> : null}
            </button>
          ))}
        </div>

        <div className="absolute bottom-4 right-4 z-20 hidden items-center gap-2 sm:flex sm:right-6">
          <button type="button" onClick={() => changeSlide(-1)} className="grid h-10 w-10 place-items-center rounded-md border border-white/70 bg-white/85 text-slate-800 shadow-sm backdrop-blur transition hover:bg-white" aria-label="Oldingi slayd"><ArrowLeft className="h-4 w-4" /></button>
          <button type="button" onClick={() => changeSlide(1)} className="grid h-10 w-10 place-items-center rounded-md bg-slate-950/90 text-white shadow-sm backdrop-blur transition hover:bg-slate-950" aria-label="Keyingi slayd"><ArrowRight className="h-4 w-4" /></button>
        </div>
      </section>

      <BrandMarquee />

      <section className="mx-auto max-w-7xl px-4 py-16 md:px-5 md:py-24">
        <ScrollReveal className="mb-9 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase text-blue-700">Ommabop bo‘limlar</p>
            <h2 className="mt-3 max-w-2xl text-3xl font-medium leading-tight text-slate-950 md:text-5xl">Kerakli texnikani tez toping</h2>
          </div>
          <Link href="/catalog" className="hidden items-center gap-1 text-sm font-semibold text-slate-800 transition hover:text-blue-700 sm:flex">Barcha kategoriyalar <ChevronRight className="h-4 w-4" /></Link>
        </ScrollReveal>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
          {categories.map((category, index) => (
            <ScrollReveal key={category.slug} delay={(index % 5) * 70} variant="scale">
              <Link href={`/catalog?category=${category.slug}`} className="group relative block aspect-[4/3] overflow-hidden rounded-lg bg-slate-900 shadow-sm">
                <Image src={category.image} alt={category.name} fill sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw" className="object-cover transition-transform duration-700 group-hover:scale-[1.045]" />
                <div className="absolute inset-0 bg-slate-950/50 transition-colors group-hover:bg-slate-950/62" />
                <div className="absolute inset-x-0 bottom-0 p-3.5 text-white sm:p-4">
                  <p className="text-xs font-medium text-slate-200">{category.caption}</p>
                  <div className="mt-1 flex items-end justify-between gap-2"><h3 className="text-sm font-semibold leading-5 sm:text-base">{category.name}</h3><ChevronRight className="h-4 w-4 shrink-0 transition-transform duration-300 group-hover:translate-x-1" /></div>
                </div>
              </Link>
            </ScrollReveal>
          ))}
        </div>
      </section>

      <section className="bg-slate-50 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-5">
          <ScrollReveal className="mb-9 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase text-blue-700">Mahsulotlar</p>
              <h2 className="mt-3 text-3xl font-medium text-slate-950 md:text-5xl">Siz uchun tanladik</h2>
              <p className="mt-3 text-sm text-slate-600">{visibleProducts.length} ta mahsulot ko‘rsatilmoqda</p>
            </div>
            <Link href="/catalog" className="hidden items-center gap-1 text-sm font-semibold text-slate-800 hover:text-blue-700 sm:flex">Barchasini ko‘rish <ChevronRight className="h-4 w-4" /></Link>
          </ScrollReveal>

          {loading ? (
            <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">{Array.from({ length: 8 }).map((_, index) => <ProductSkeleton key={index} />)}</div>
          ) : products.length ? (
            <>
              <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">{visibleProducts.map((product, index) => <ScrollReveal key={product.id} delay={(index % 4) * 70} variant="scale"><ProductCard product={product} /></ScrollReveal>)}</div>
              {remainingProducts > 0 ? (
                <div className="mt-10 flex justify-center">
                  <Button variant="outline" className="h-12 min-w-52 bg-white" onClick={() => setVisibleCount((count) => count + LOAD_MORE_COUNT)}><Plus className="h-4 w-4" /> Yana {Math.min(LOAD_MORE_COUNT, remainingProducts)} ta yuklash</Button>
                </div>
              ) : null}
            </>
          ) : (
            <ScrollReveal variant="scale" className="flex flex-col items-center rounded-lg border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
              {loadError ? <RefreshCw className="h-8 w-8 text-blue-600" /> : <ShoppingBag className="h-8 w-8 text-blue-600" />}
              <h3 className="mt-3 font-semibold text-slate-900">{loadError ? 'Mahsulotlarni yuklab bo‘lmadi' : 'Mahsulotlar katalogda ko‘rinadi'}</h3>
              <p className="mt-1 max-w-md text-sm text-slate-500">{loadError || 'Eng so‘nggi takliflar va yangi modellarni katalogdan ko‘ring.'}</p>
              {loadError ? (
                <Button type="button" variant="outline" className="mt-5" onClick={() => setReloadKey((key) => key + 1)}><RefreshCw className="h-4 w-4" /> Qayta urinish</Button>
              ) : (
                <Button asChild variant="outline" className="mt-5"><Link href="/catalog">Katalogni ochish</Link></Button>
              )}
            </ScrollReveal>
          )}
        </div>
      </section>

    </div>
  );
}

function ProductSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white p-3">
      <div className="skeleton-pulse aspect-square rounded-md bg-slate-100" />
      <div className="mt-4 space-y-3"><div className="skeleton-pulse h-3 w-1/3 rounded bg-slate-100" /><div className="skeleton-pulse h-4 w-4/5 rounded bg-slate-100" /><div className="skeleton-pulse h-4 w-1/2 rounded bg-slate-100" /><div className="skeleton-pulse mt-5 h-10 rounded bg-slate-100" /></div>
    </div>
  );
}
