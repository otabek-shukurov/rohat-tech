'use client';

import { BadgeCheck, PackageSearch, Search, SlidersHorizontal, Truck, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { ProductCard } from '@/components/product-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Product, api, isDemoMode } from '@/lib/api';
import { CatalogMeta, demoCatalogMeta, demoProducts, filterDemoProducts } from '@/lib/demo-catalog';
import { cn } from '@/lib/utils';

export default function CatalogPage() {
  const [products, setProducts] = useState<Product[]>(demoProducts);
  const [meta, setMeta] = useState<CatalogMeta>(demoCatalogMeta);
  const [q, setQ] = useState('');
  const [debouncedQ, setDebouncedQ] = useState('');
  const [category, setCategory] = useState('');
  const [brand, setBrand] = useState('');
  const [discountOnly, setDiscountOnly] = useState(false);
  const [sort, setSort] = useState('newest');
  const [loading, setLoading] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const initialQuery = params.get('q') ?? '';
    setQ(initialQuery);
    setDebouncedQ(initialQuery);
    setCategory(params.get('category') ?? '');
    setBrand(params.get('brand') ?? '');
    setDiscountOnly(params.get('discount') === 'true');
    setProducts(filterDemoProducts({
      q: initialQuery,
      category: params.get('category') ?? '',
      brand: params.get('brand') ?? '',
      discountOnly: params.get('discount') === 'true'
    }));
    setInitialized(true);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQ(q.trim()), 280);
    return () => window.clearTimeout(timer);
  }, [q]);

  useEffect(() => {
    if (isDemoMode) return;

    api<CatalogMeta>('/catalog/meta')
      .then((items) => setMeta(items.categories.length || items.brands.length ? items : demoCatalogMeta))
      .catch(() => setMeta(demoCatalogMeta));
  }, []);

  useEffect(() => {
    if (!initialized) return;

    const params = new URLSearchParams();
    if (debouncedQ) params.set('q', debouncedQ);
    if (category) params.set('category', category);
    if (brand) params.set('brand', brand);

    let cancelled = false;
    setProducts(filterDemoProducts({ q: debouncedQ, category, brand, discountOnly }));
    setLoading(false);
    if (isDemoMode) return;

    api<Product[]>(`/products${params.size ? `?${params}` : ''}`)
      .then((items) => {
        if (cancelled) return;
        const catalogItems = !items.length && !debouncedQ && !category && !brand ? demoProducts : items;
        setProducts(discountOnly ? catalogItems.filter((item) => item.discountPrice) : catalogItems);
      })
      .catch(() => {
        if (!cancelled) setProducts(filterDemoProducts({ q: debouncedQ, category, brand, discountOnly }));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [brand, category, debouncedQ, discountOnly, initialized]);

  useEffect(() => {
    if (!initialized) return;
    const params = new URLSearchParams();
    if (q.trim()) params.set('q', q.trim());
    if (category) params.set('category', category);
    if (brand) params.set('brand', brand);
    if (discountOnly) params.set('discount', 'true');
    window.history.replaceState({}, '', `/catalog${params.size ? `?${params}` : ''}`);
    window.dispatchEvent(new Event('rohat:locationchange'));
  }, [brand, category, discountOnly, initialized, q]);

  const visibleProducts = useMemo(() => {
    const search = debouncedQ.toLocaleLowerCase('uz');
    const items = products.filter((item) => {
      const matchesSearch = !search || `${item.name} ${item.category.name} ${item.brand.name}`.toLocaleLowerCase('uz').includes(search);
      const matchesCategory = !category || item.category.slug === category;
      const matchesBrand = !brand || item.brand.slug === brand;
      const matchesDiscount = !discountOnly || Boolean(item.discountPrice);
      return matchesSearch && matchesCategory && matchesBrand && matchesDiscount;
    });
    if (sort === 'price-asc') return items.sort((a, b) => Number(a.discountPrice ?? a.price) - Number(b.discountPrice ?? b.price));
    if (sort === 'price-desc') return items.sort((a, b) => Number(b.discountPrice ?? b.price) - Number(a.discountPrice ?? a.price));
    return items;
  }, [brand, category, debouncedQ, discountOnly, products, sort]);

  const hasFilters = Boolean(q.trim() || category || brand || discountOnly);
  const categoryName = meta.categories.find((item) => item.slug === category)?.name;
  const brandName = meta.brands.find((item) => item.slug === brand)?.name;

  function clearFilters() {
    setQ('');
    setCategory('');
    setBrand('');
    setDiscountOnly(false);
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 pb-16 pt-5 md:px-5 md:pb-24 md:pt-6">
        <div className="mb-5 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between sm:gap-5">
          <div>
            <h1 className="text-2xl font-semibold leading-tight text-slate-950 md:text-3xl">Mahsulotlar katalogi</h1>
            <p className="mt-1 text-sm text-slate-500">Uy uchun ishonchli texnikani tez va qulay tanlang.</p>
          </div>
          <div className="mt-3 hidden items-center gap-5 text-xs font-medium text-slate-600 sm:flex">
            <span className="flex items-center gap-1.5"><Truck className="h-4 w-4 text-blue-600" /> Bepul yetkazish</span>
            <span className="flex items-center gap-1.5"><BadgeCheck className="h-4 w-4 text-emerald-600" /> Rasmiy kafolat</span>
          </div>
        </div>

        <div className="mb-5 flex gap-3">
          <label className="relative min-w-0 flex-1">
            <span className="sr-only">Mahsulot qidirish</span>
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-400" />
            <Input value={q} onChange={(event) => setQ(event.target.value)} placeholder="Mahsulot, model yoki brendni qidiring" className="h-12 bg-white pl-11 shadow-sm" />
          </label>
          <Button variant="outline" className="h-12 px-3 md:hidden" onClick={() => setFiltersOpen((open) => !open)} aria-expanded={filtersOpen}>
            {filtersOpen ? <X className="h-4 w-4" /> : <SlidersHorizontal className="h-4 w-4" />}
            <span className="hidden min-[360px]:inline">Filter</span>
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-[220px_minmax(0,1fr)] lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-8">
          <aside className={cn('h-fit md:sticky md:top-[174px] md:block md:border-r md:border-slate-200 md:pr-6', filtersOpen ? 'block rounded-md border border-slate-200 bg-white p-4' : 'hidden')}>
            <FilterPanel meta={meta} category={category} brand={brand} discountOnly={discountOnly} hasFilters={hasFilters} onCategory={setCategory} onBrand={setBrand} onDiscount={setDiscountOnly} onClear={clearFilters} />
          </aside>

          <section className="min-w-0" aria-live="polite">
            <div className="flex min-h-11 flex-col gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-medium text-slate-700">{loading ? 'Mahsulotlar yuklanmoqda...' : `${visibleProducts.length} ta mahsulot topildi`}</p>
              <label className="flex items-center gap-2 text-sm text-slate-500">
                <span className="shrink-0">Saralash:</span>
                <select value={sort} onChange={(event) => setSort(event.target.value)} className="h-10 min-w-40 rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100">
                  <option value="newest">Eng yangilari</option>
                  <option value="price-asc">Narx: arzonidan</option>
                  <option value="price-desc">Narx: qimmatidan</option>
                </select>
              </label>
            </div>

            {hasFilters ? (
              <div className="flex flex-wrap items-center gap-2 py-4">
                {q.trim() ? <FilterTag label={`“${q.trim()}”`} onRemove={() => setQ('')} /> : null}
                {categoryName ? <FilterTag label={categoryName} onRemove={() => setCategory('')} /> : null}
                {brandName ? <FilterTag label={brandName} onRemove={() => setBrand('')} /> : null}
                {discountOnly ? <FilterTag label="Chegirmadagi mahsulotlar" onRemove={() => setDiscountOnly(false)} /> : null}
              </div>
            ) : <div className="h-4" />}

            {loading ? (
              <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">{Array.from({ length: 9 }).map((_, index) => <CatalogSkeleton key={index} />)}</div>
            ) : visibleProducts.length ? (
              <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">{visibleProducts.map((item) => <ProductCard key={item.id} product={item} />)}</div>
            ) : (
              <div className="flex min-h-80 flex-col items-center justify-center border-y border-dashed border-slate-300 px-6 text-center">
                <span className="grid h-12 w-12 place-items-center rounded-md bg-blue-50 text-blue-700"><PackageSearch className="h-6 w-6" /></span>
                <h2 className="mt-4 text-lg font-semibold text-slate-950">Mos mahsulot topilmadi</h2>
                <p className="mt-1 max-w-md text-sm leading-6 text-slate-500">Qidiruv so‘zini qisqartiring yoki tanlangan filterlardan birini olib tashlang.</p>
                <Button variant="outline" className="mt-5" onClick={clearFilters}>Barcha filterlarni tozalash</Button>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

function FilterPanel({ meta, category, brand, discountOnly, hasFilters, onCategory, onBrand, onDiscount, onClear }: {
  meta: CatalogMeta;
  category: string;
  brand: string;
  discountOnly: boolean;
  hasFilters: boolean;
  onCategory: (value: string) => void;
  onBrand: (value: string) => void;
  onDiscount: (value: boolean) => void;
  onClear: () => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-slate-950">Filterlar</h2>
        {hasFilters ? <button type="button" onClick={onClear} className="text-xs font-semibold text-blue-700 transition hover:text-blue-900">Tozalash</button> : null}
      </div>
      <FilterGroup label="Kategoriya" value={category} onChange={onCategory} options={meta.categories} allLabel="Barchasi" />
      <FilterGroup label="Brend" value={brand} onChange={onBrand} options={meta.brands} allLabel="Barcha brendlar" />
      <label className="mt-6 flex cursor-pointer items-start gap-3 border-t border-slate-200 pt-5">
        <input type="checkbox" checked={discountOnly} onChange={(event) => onDiscount(event.target.checked)} className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
        <span><span className="block text-sm font-semibold text-slate-800">Faqat chegirmalar</span><span className="mt-0.5 block text-xs leading-5 text-slate-500">Maxsus narxdagi takliflar</span></span>
      </label>
    </div>
  );
}

function FilterGroup({ label, value, onChange, options, allLabel }: { label: string; value: string; onChange: (value: string) => void; options: CatalogMeta['categories']; allLabel: string }) {
  return (
    <div className="mt-6 border-t border-slate-200 pt-5">
      <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
      <div className="mt-2 space-y-1">
        {[{ id: `${label}-all`, name: allLabel, slug: '' }, ...options].map((item) => (
          <button key={item.id} type="button" onClick={() => onChange(item.slug)} className={cn('flex min-h-9 w-full items-center justify-between rounded-md px-2.5 text-left text-sm transition', value === item.slug ? 'bg-blue-50 font-semibold text-blue-700' : 'text-slate-600 hover:bg-white hover:text-slate-950')}>
            <span>{item.name}</span>
            <span className={cn('h-2 w-2 rounded-full border', value === item.slug ? 'border-blue-600 bg-blue-600' : 'border-slate-300')} />
          </button>
        ))}
      </div>
    </div>
  );
}

function FilterTag({ label, onRemove }: { label: string; onRemove: () => void }) {
  return <button type="button" onClick={onRemove} className="inline-flex h-8 items-center gap-1.5 rounded-md border border-blue-200 bg-blue-50 px-2.5 text-xs font-semibold text-blue-800 transition hover:border-blue-300 hover:bg-blue-100">{label}<X className="h-3.5 w-3.5" /></button>;
}

function CatalogSkeleton() {
  return <div className="overflow-hidden rounded-lg border border-slate-200 bg-white p-3"><div className="skeleton-pulse aspect-square rounded-md bg-slate-100" /><div className="mt-4 space-y-3"><div className="skeleton-pulse h-3 w-1/3 rounded bg-slate-100" /><div className="skeleton-pulse h-4 w-4/5 rounded bg-slate-100" /><div className="skeleton-pulse h-4 w-1/2 rounded bg-slate-100" /><div className="skeleton-pulse h-10 rounded bg-slate-100" /></div></div>;
}
