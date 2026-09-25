import Image from 'next/image';
import Link from 'next/link';
import { type CSSProperties } from 'react';
import { ArrowUpRight, Search, ShieldCheck, Truck } from 'lucide-react';
import { ScrollReveal } from '@/components/scroll-reveal';

const steps = [
  {
    number: '01',
    icon: Search,
    eyebrow: 'Oson tanlov',
    title: 'Kerakli texnikani tez toping',
    text: 'Kategoriya, brend va xususiyatlar bo‘yicha saralang. Muhim ma’lumotlar bir qarashda ko‘rinadi.',
    image: '/images/hero-tv.png',
    imagePosition: '72% center',
    color: 'bg-slate-50'
  },
  {
    number: '02',
    icon: ShieldCheck,
    eyebrow: 'Ishonchli xarid',
    title: 'Kafolat bilan xotirjam buyurtma bering',
    text: 'Narx, ombor holati va texnik tavsif aniq. Barcha mahsulotlar rasmiy kafolat bilan taqdim etiladi.',
    image: '/images/hero-fridge.png',
    imagePosition: '70% center',
    color: 'bg-blue-50'
  },
  {
    number: '03',
    icon: Truck,
    eyebrow: 'Qulay qabul qilish',
    title: 'Vobkent bo‘ylab bepul yetkazib beramiz',
    text: 'Yetkazib berish yoki magazindan olib ketishni tanlang. Buyurtma holatini profilingizdan kuzating.',
    image: '/images/hero-washer.png',
    imagePosition: '72% center',
    color: 'bg-emerald-50'
  }
];

export function HomeExperience() {
  return (
    <section className="border-y border-slate-200 bg-white py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 md:px-5">
        <div className="mx-auto mb-12 max-w-3xl text-center md:mb-16">
          <p className="text-xs font-semibold uppercase text-blue-700">Rohat Tech tajribasi</p>
          <h2 className="mt-4 text-3xl font-medium leading-tight text-slate-950 md:text-5xl">Texnika xaridi uchta sodda bosqichda</h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-600">Tanlashdan yetkazib berishgacha bo‘lgan jarayonni tushunarli va nazorat qilinadigan qildik.</p>
        </div>

        <div>
          {steps.map(({ number, icon: Icon, eyebrow, title, text, image, imagePosition, color }, index) => (
            <ScrollReveal key={number} variant="scale" delay={index * 90} className="experience-card-shell" style={{ '--stack-offset': `${index * 14}px` } as CSSProperties}>
              <article className={`experience-card grid min-h-[430px] overflow-hidden rounded-lg border border-slate-200 shadow-[0_18px_60px_rgba(15,23,42,0.10)] lg:grid-cols-[0.88fr_1.12fr] ${color}`}>
                <div className="flex flex-col justify-between p-6 sm:p-8 lg:p-12">
                  <div className="flex items-center justify-between">
                    <span className="grid h-11 w-11 place-items-center rounded-md bg-white text-blue-700 shadow-sm"><Icon className="h-5 w-5" /></span>
                    <span className="text-sm font-semibold text-slate-400">{number} / 03</span>
                  </div>
                  <div className="mt-14 lg:mt-8">
                    <p className="text-xs font-semibold uppercase text-blue-700">{eyebrow}</p>
                    <h3 className="mt-3 max-w-lg text-3xl font-medium leading-tight text-slate-950 md:text-4xl">{title}</h3>
                    <p className="mt-4 max-w-lg text-sm leading-7 text-slate-600 md:text-base">{text}</p>
                    <Link href="/catalog" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-950 transition hover:text-blue-700">Katalogni ko‘rish <ArrowUpRight className="h-4 w-4" /></Link>
                  </div>
                </div>
                <div className="relative min-h-72 overflow-hidden border-t border-slate-200 bg-white lg:border-l lg:border-t-0">
                  <Image src={image} alt="" fill sizes="(max-width: 1024px) 100vw, 56vw" className="object-cover transition-transform duration-700 hover:scale-[1.025]" style={{ objectPosition: imagePosition }} />
                </div>
              </article>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
