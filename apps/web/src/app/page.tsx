'use client';

import Image from 'next/image';
import Link from 'next/link';
import { type CSSProperties, useEffect, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  ChevronRight,
  Headphones,
  PackageCheck,
  ShieldCheck,
  ShoppingBag,
  Truck
} from 'lucide-react';
import { BrandMarquee } from '@/components/brand-marquee';
import { HomeExperience } from '@/components/home-experience';
import { ProductCard } from '@/components/product-card';
import { ScrollReveal } from '@/components/scroll-reveal';
import { Button } from '@/components/ui/button';
import { Product, api, isDemoMode } from '@/lib/api';
import { demoProducts } from '@/lib/demo-catalog';
import { cn } from '@/lib/utils';

const heroSlides = [
  { image: '/images/rohat-tech-hero.png', label: 'Uy uchun to‘liq yechim', title: 'Yangi avlod maishiy texnikasi', position: 'center', mobilePosition: '67% center', motion: 'hero-media--right' },
  { image: '/images/hero-tv.png', label: 'Katta ekranlar', title: 'Kino kayfiyati endi uyda', position: 'center', mobilePosition: '64% center', motion: 'hero-media--left' },
  { image: '/images/hero-fridge.png', label: 'Oshxona uchun', title: 'Har kuni yangi va qulay', position: 'center', mobilePosition: '69% center', motion: 'hero-media--right' },
  { image: '/images/hero-washer.png', label: 'Kundalik yordamchi', title: 'Tozalik kamroq vaqt talab qiladi', position: 'center', mobilePosition: '68% center', motion: 'hero-media--left' }
];

const categories = [
  { title: 'Sovutgichlar', caption: 'Oshxona uchun', image: '/images/hero-fridge.png', position: '70% center' },
  { title: 'Televizorlar', caption: 'Tiniq tasvir', image: '/images/hero-tv.png', position: '75% center' },
  { title: 'Kir yuvish mashinalari', caption: 'Kundalik qulaylik', image: '/images/hero-washer.png', position: '72% center' },
  { title: 'Konditsionerlar', caption: 'Har faslda komfort', image: '/images/rohat-tech-hero.png', position: '82% 25%' }
];

const services = [
  { icon: Truck, title: 'Bepul yetkazib berish', text: 'Vobkent bo‘ylab buyurtmangizni manzilingizgacha bepul olib boramiz.' },
  { icon: ShieldCheck, title: 'Rasmiy kafolat', text: 'Barcha mahsulotlar tekshirilgan va kafolat hujjati bilan.' },
  { icon: Headphones, title: 'Mutaxassis maslahati', text: 'Tanlovdan keyingi servisgacha yordam beramiz.' },
  { icon: PackageCheck, title: 'Olib ketish imkoniyati', text: 'Tayyor buyurtmani magazindan qulay vaqtda oling.' }
];

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>(isDemoMode ? demoProducts.slice(0, 4) : []);
  const [loading, setLoading] = useState(!isDemoMode);
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    if (isDemoMode) return;

    api<Product[]>('/products')
      .then((items) => setProducts(items.slice(0, 4)))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => setActiveSlide((current) => (current + 1) % heroSlides.length), 6500);
    return () => window.clearInterval(timer);
  }, []);

  function changeSlide(direction: number) {
    setActiveSlide((current) => (current + direction + heroSlides.length) % heroSlides.length);
  }

  const activeHero = heroSlides[activeSlide];

  return (
    <div className="overflow-x-clip bg-white">
      <section data-hero-carousel className="relative h-[100svh] min-h-[620px] max-h-[920px] w-full overflow-hidden bg-slate-100 sm:min-h-[680px] lg:min-h-[720px] lg:max-h-none" aria-roledescription="carousel" aria-label="Rohat Tech takliflari">
        {heroSlides.map((slide, index) => (
          <div key={slide.image} className={cn('absolute inset-0 transition-[opacity,transform] duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)]', index === activeSlide ? 'scale-100 opacity-100' : 'pointer-events-none scale-[1.015] opacity-0')} aria-hidden={index !== activeSlide}>
            <Image
              src={slide.image}
              alt=""
              fill
              priority={index === 0}
              sizes="100vw"
              className={cn('hero-media object-cover', index === activeSlide && `hero-media--active ${slide.motion}`)}
              style={{ '--hero-position': slide.position, '--hero-position-mobile': slide.mobilePosition } as CSSProperties}
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
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category, index) => (
            <ScrollReveal key={category.title} delay={index * 90} variant="scale">
              <Link href="/catalog" className="group relative block aspect-[4/3] overflow-hidden rounded-lg bg-slate-900 shadow-sm">
                <Image src={category.image} alt={category.title} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" className="object-cover transition-transform duration-700 group-hover:scale-[1.045]" style={{ objectPosition: category.position }} />
                <div className="absolute inset-0 bg-slate-950/50 transition-colors group-hover:bg-slate-950/62" />
                <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                  <p className="text-xs font-medium text-slate-200">{category.caption}</p>
                  <div className="mt-1 flex items-center justify-between gap-3"><h3 className="text-lg font-semibold">{category.title}</h3><ChevronRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" /></div>
                </div>
              </Link>
            </ScrollReveal>
          ))}
        </div>
      </section>

      <HomeExperience />

      <section className="bg-slate-50 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-5">
          <ScrollReveal className="mb-9 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase text-blue-700">Yangi kelganlar</p>
              <h2 className="mt-3 text-3xl font-medium text-slate-950 md:text-5xl">Siz uchun tanladik</h2>
              <p className="mt-3 text-sm text-slate-600">Ombordagi yangi va ommabop modellar</p>
            </div>
            <Link href="/catalog" className="hidden items-center gap-1 text-sm font-semibold text-slate-800 hover:text-blue-700 sm:flex">Barchasini ko‘rish <ChevronRight className="h-4 w-4" /></Link>
          </ScrollReveal>

          {loading ? (
            <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">{Array.from({ length: 4 }).map((_, index) => <ProductSkeleton key={index} />)}</div>
          ) : products.length ? (
            <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">{products.map((product, index) => <ScrollReveal key={product.id} delay={index * 80} variant="scale"><ProductCard product={product} /></ScrollReveal>)}</div>
          ) : (
            <ScrollReveal variant="scale" className="flex flex-col items-center rounded-lg border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
              <ShoppingBag className="h-8 w-8 text-blue-600" />
              <h3 className="mt-3 font-semibold text-slate-900">Mahsulotlar katalogda ko‘rinadi</h3>
              <p className="mt-1 max-w-md text-sm text-slate-500">Eng so‘nggi takliflar va yangi modellarni katalogdan ko‘ring.</p>
              <Button asChild variant="outline" className="mt-5"><Link href="/catalog">Katalogni ochish</Link></Button>
            </ScrollReveal>
          )}
        </div>
      </section>

      <section className="border-y border-slate-200 bg-[#eaf1ff] py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-5">
          <ScrollReveal className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-semibold uppercase text-blue-700">Rohat Tech standarti</p>
            <h2 className="mt-3 text-3xl font-medium leading-tight text-slate-950 md:text-5xl">Xariddan keyin ham yoningizdamiz</h2>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-600">Texnikani tanlash, yetkazib berish va servis jarayonlari tushunarli va nazorat qilinadigan bo‘lishi kerak.</p>
          </ScrollReveal>
          <div className="mt-12 grid gap-x-8 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
            {services.map(({ icon: Icon, title, text }, index) => (
              <ScrollReveal key={title} delay={index * 90} variant={index % 2 === 0 ? 'left' : 'right'} className="border-t border-blue-200 pt-6">
                <span className="grid h-11 w-11 place-items-center rounded-md bg-white text-blue-700 shadow-sm"><Icon className="h-5 w-5" /></span>
                <h3 className="mt-5 text-lg font-semibold text-slate-950">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-950 text-white">
        <ScrollReveal className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-16 md:flex-row md:items-center md:justify-between md:px-5 md:py-20">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-blue-300"><BadgeCheck className="h-5 w-5" /> Ishonchli xarid</div>
            <h2 className="mt-4 max-w-3xl text-3xl font-medium leading-tight md:text-5xl">Uyingiz uchun mos texnikani bugun toping</h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-400">Kategoriya, brend va narx bo‘yicha saralang. Qolgan jarayonni biz qulay qilamiz.</p>
          </div>
          <Button asChild className="self-start bg-white text-slate-950 shadow-none hover:bg-blue-50 md:self-auto"><Link href="/catalog">Xaridni boshlash <ArrowUpRight className="h-4 w-4" /></Link></Button>
        </ScrollReveal>
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
