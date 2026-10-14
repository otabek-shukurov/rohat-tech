'use client';

import { FormEvent, type ReactNode, useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  ImagePlus,
  Link2,
  Loader2,
  PackagePlus,
  Plus,
  Trash2,
  UploadCloud
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api, isDemoMode, type Product } from '@/lib/api';
import { demoProducts } from '@/lib/demo-catalog';
import { cn, formatPrice } from '@/lib/utils';

type Meta = {
  categories: Array<{ id: string; name: string }>;
  brands: Array<{ id: string; name: string }>;
};

type SpecRow = { id: string; key: string; value: string };

type Draft = {
  name: string;
  slug: string;
  description: string;
  price: string;
  discountPrice: string;
  stock: string;
  imageUrl: string;
  categoryId: string;
  brandId: string;
  warranty: string;
  model: string;
  color: string;
  country: string;
  unit: string;
  specs: SpecRow[];
};

type ProductFormProps = {
  product?: Product | null;
  onCancel: () => void;
  onSaved?: (product: Product) => void | Promise<void>;
};

const inputClass = 'h-11 w-full rounded-md border border-slate-300 bg-white px-3.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100';
const knownSpecKeys = ['kafolat', 'model', 'rang', 'ishlab chiqarilgan davlat', 'o‘lchov birligi'];

export function ProductForm({ product, onCancel, onSaved }: ProductFormProps) {
  const [draft, setDraft] = useState<Draft>(() => productToDraft(product));
  const [meta, setMeta] = useState<Meta>({ categories: [], brands: [] });
  const [metaLoading, setMetaLoading] = useState(true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState(product?.images[0]?.url ?? '');
  const [dragActive, setDragActive] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [slugTouched, setSlugTouched] = useState(Boolean(product));
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setDraft(productToDraft(product));
    setImageFile(null);
    setPreviewUrl(product?.images[0]?.url ?? '');
    setDragActive(false);
    setShowUrlInput(false);
    setSlugTouched(Boolean(product));
    setSaving(false);
    setSuccess(false);
    setError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [product]);

  useEffect(() => {
    if (isDemoMode) {
      setMeta({
        categories: uniqueOptions(demoProducts.map((item) => item.category)),
        brands: uniqueOptions(demoProducts.map((item) => item.brand))
      });
      setMetaLoading(false);
      return;
    }
    let active = true;
    setMetaLoading(true);
    api<Meta>('/catalog/meta')
      .then((result) => active && setMeta(result))
      .catch((reason) => active && setError(reason instanceof Error ? reason.message : 'Kategoriya va brendlarni yuklab bo‘lmadi'))
      .finally(() => active && setMetaLoading(false));
    return () => { active = false; };
  }, []);

  function setField<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function selectImage(file?: File) {
    setError('');
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Faqat JPG, PNG yoki WebP rasm tanlang.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Rasm hajmi 5 MB dan oshmasligi kerak.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setPreviewUrl(String(reader.result ?? ''));
    reader.readAsDataURL(file);
    setImageFile(file);
  }

  function removeImage() {
    setImageFile(null);
    setPreviewUrl('');
    setField('imageUrl', '');
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function addSpec() {
    setField('specs', [...draft.specs, { id: createRowId(), key: '', value: '' }]);
  }

  function updateSpec(id: string, field: 'key' | 'value', value: string) {
    setField('specs', draft.specs.map((row) => row.id === id ? { ...row, [field]: value } : row));
  }

  function removeSpec(id: string) {
    setField('specs', draft.specs.filter((row) => row.id !== id));
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setSuccess(false);
    if (isDemoMode) {
      setError('Demo rejimida bazaga yozish o‘chirilgan.');
      return;
    }
    const price = Number(draft.price);
    const discountPrice = draft.discountPrice ? Number(draft.discountPrice) : null;
    const stock = Number(draft.stock);
    if (!draft.categoryId || !draft.brandId) return setError('Kategoriya va brendni tanlang.');
    if (!Number.isFinite(price) || price <= 0) return setError('Asosiy narx 0 dan katta bo‘lishi kerak.');
    if (discountPrice !== null && (!Number.isFinite(discountPrice) || discountPrice <= 0 || discountPrice >= price)) {
      return setError('Chegirma narxi asosiy narxdan kichik va 0 dan katta bo‘lishi kerak.');
    }
    if (!Number.isInteger(stock) || stock < 0) return setError('Ombordagi son 0 yoki undan katta butun son bo‘lishi kerak.');
    setSaving(true);
    try {
      let imageUrl = draft.imageUrl.trim() || product?.images[0]?.url || '/images/rohat-tech-hero.png';
      if (imageFile) {
        const formData = new FormData();
        formData.append('file', imageFile);
        const upload = await api<{ url: string }>('/admin/uploads/product-image', { method: 'POST', body: formData });
        imageUrl = upload.url;
      }
      const specs = Object.fromEntries([
        ['Kafolat', draft.warranty],
        ['Model', draft.model],
        ['Rang', draft.color],
        ['Ishlab chiqarilgan davlat', draft.country],
        ['O‘lchov birligi', draft.unit],
        ...draft.specs.map((row) => [row.key, row.value])
      ].filter(([key, value]) => key.trim() && value.trim()).map(([key, value]) => [key.trim(), value.trim()]));
      const saved = await api<Product>(product ? `/admin/products/${product.id}` : '/admin/products', {
        method: product ? 'PATCH' : 'POST',
        body: JSON.stringify({
          name: draft.name.trim(),
          slug: draft.slug.trim(),
          description: draft.description.trim(),
          price,
          discountPrice,
          stock,
          categoryId: draft.categoryId,
          brandId: draft.brandId,
          imageUrl: !product || imageFile || imageUrl !== product.images[0]?.url ? imageUrl : undefined,
          specs
        })
      });
      setSuccess(true);
      await onSaved?.(saved);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Mahsulotni saqlab bo‘lmadi');
    } finally {
      setSaving(false);
    }
  }

  const effectivePrice = Number(draft.discountPrice || draft.price || 0);

  return (
    <div className="mx-auto max-w-[1180px] px-4 py-6 md:px-6 lg:px-8 lg:py-8">
        <header className="flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold text-blue-700">{product ? 'Mahsulotni tahrirlash' : 'Yangi mahsulot'}</p>
            <h1 className="mt-1 text-2xl font-bold text-slate-950 md:text-3xl">{product ? product.name : 'Katalogga mahsulot qo‘shish'}</h1>
            <p className="mt-2 text-sm text-slate-500">Majburiy maydonlarni to‘ldiring, narx va rasmni tekshirib saqlang.</p>
          </div>
          <Button type="button" variant="outline" onClick={onCancel} disabled={saving}>Mahsulotlarga qaytish</Button>
        </header>

        <form onSubmit={save} className="mt-6 space-y-8 rounded-lg border border-slate-200 bg-white px-5 py-6 shadow-sm md:px-8 md:py-8">
          <FormSection title="Asosiy ma’lumotlar" description="Katalogda mijoz birinchi ko‘radigan ma’lumotlar.">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Mahsulot nomi" required><Input required value={draft.name} onChange={(event) => { const name = event.target.value; setDraft((current) => ({ ...current, name, slug: slugTouched ? current.slug : toSlug(name) })); }} placeholder="Masalan, Bosch Serie 6" /></Field>
              <Field label="Slug" required hint="Sayt manzilida ishlatiladi"><Input required value={draft.slug} onChange={(event) => { setSlugTouched(true); setField('slug', toSlug(event.target.value)); }} placeholder="bosch-serie-6" /></Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Kategoriya" required><select required disabled={metaLoading} value={draft.categoryId} onChange={(event) => setField('categoryId', event.target.value)} className={inputClass}><option value="">{metaLoading ? 'Yuklanmoqda...' : 'Kategoriyani tanlang'}</option>{meta.categories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></Field>
              <Field label="Brend" required><select required disabled={metaLoading} value={draft.brandId} onChange={(event) => setField('brandId', event.target.value)} className={inputClass}><option value="">{metaLoading ? 'Yuklanmoqda...' : 'Brendni tanlang'}</option>{meta.brands.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></Field>
            </div>
            <Field label="Mahsulot tavsifi" required hint="Asosiy afzalliklar va foydalanish maqsadini aniq yozing"><textarea required rows={5} value={draft.description} onChange={(event) => setField('description', event.target.value)} placeholder="Mahsulot haqida batafsil ma’lumot..." className="w-full resize-y rounded-md border border-slate-300 px-3.5 py-3 text-sm leading-6 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" /></Field>
          </FormSection>

          <FormSection title="Narx va ombor" description="Chegirma narxi bo‘lsa, u asosiy narxdan kichik bo‘lishi kerak.">
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Asosiy narx" required><MoneyInput required value={draft.price} onChange={(value) => setField('price', value)} placeholder="5 000 000" /></Field>
              <Field label="Chegirma narxi"><MoneyInput value={draft.discountPrice} onChange={(value) => setField('discountPrice', value)} placeholder="Ixtiyoriy" /></Field>
              <Field label="Ombordagi son" required><Input required min="0" step="1" type="number" value={draft.stock} onChange={(event) => setField('stock', event.target.value)} /></Field>
            </div>
            {effectivePrice > 0 ? <div className="flex items-center justify-between rounded-md bg-slate-50 px-4 py-3 text-sm"><span className="font-medium text-slate-500">Katalogdagi narx</span><strong className="text-blue-700">{formatPrice(effectivePrice)}</strong></div> : null}
          </FormSection>

          <FormSection title="Mahsulot rasmi" description="Oq yoki neytral fondagi, kamida 1200×1200 px rasm tavsiya qilinadi. Rasm tanlanmasa standart rasm ishlatiladi.">
            <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(event) => selectImage(event.target.files?.[0])} />
            <div className="grid gap-4 sm:grid-cols-[220px_minmax(0,1fr)]">
              <div className="relative aspect-square overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                {previewUrl ? <img src={previewUrl} alt="Mahsulot rasmi preview" className="h-full w-full object-contain p-3" /> : <div className="grid h-full place-items-center text-slate-300"><ImagePlus className="h-12 w-12" /></div>}
                {previewUrl ? <button type="button" onClick={removeImage} title="Rasmni olib tashlash" className="absolute right-2 top-2 grid h-9 w-9 place-items-center rounded-md bg-white text-rose-600 shadow-md"><Trash2 className="h-4 w-4" /></button> : null}
              </div>
              <div className="space-y-3">
                <button type="button" onClick={() => fileInputRef.current?.click()} onDragEnter={(event) => { event.preventDefault(); setDragActive(true); }} onDragOver={(event) => event.preventDefault()} onDragLeave={() => setDragActive(false)} onDrop={(event) => { event.preventDefault(); setDragActive(false); selectImage(event.dataTransfer.files[0]); }} className={cn('flex min-h-40 w-full flex-col items-center justify-center rounded-lg border-2 border-dashed px-5 text-center transition', dragActive ? 'border-blue-500 bg-blue-50' : 'border-slate-300 hover:border-blue-400 hover:bg-blue-50/40')}><UploadCloud className="h-7 w-7 text-blue-600" /><span className="mt-3 text-sm font-bold text-slate-900">Rasm tanlang yoki shu yerga tashlang</span><span className="mt-1 text-xs text-slate-500">JPG, PNG, WebP · maksimal 5 MB</span></button>
                <button type="button" onClick={() => setShowUrlInput((value) => !value)} className="inline-flex items-center gap-2 text-xs font-bold text-blue-700"><Link2 className="h-4 w-4" />Rasm URL orqali kiritish</button>
                {showUrlInput ? <Input type="url" value={draft.imageUrl} onChange={(event) => { setField('imageUrl', event.target.value); if (!imageFile) setPreviewUrl(event.target.value); }} placeholder="https://..." /> : null}
              </div>
            </div>
          </FormSection>

          <FormSection title="Texnik xususiyatlar" description="Filtrlash va mahsulot sahifasidagi jadval uchun aniq qiymatlar kiriting.">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Model"><Input value={draft.model} onChange={(event) => setField('model', event.target.value)} placeholder="WGA24400ME" /></Field>
              <Field label="Rang"><Input value={draft.color} onChange={(event) => setField('color', event.target.value)} placeholder="Oq" /></Field>
              <Field label="Ishlab chiqarilgan davlat"><Input value={draft.country} onChange={(event) => setField('country', event.target.value)} placeholder="Turkiya" /></Field>
              <Field label="Kafolat"><select value={draft.warranty} onChange={(event) => setField('warranty', event.target.value)} className={inputClass}><option value="Kafolatsiz">Kafolatsiz</option><option value="6 oy">6 oy</option><option value="12 oy">12 oy</option><option value="24 oy">24 oy</option><option value="36 oy">36 oy</option></select></Field>
              <Field label="O‘lchov birligi"><select value={draft.unit} onChange={(event) => setField('unit', event.target.value)} className={inputClass}><option value="dona">Dona</option><option value="to‘plam">To‘plam</option><option value="juft">Juft</option></select></Field>
            </div>
            <div className="space-y-3 border-t border-slate-200 pt-5">
              <div className="flex items-center justify-between gap-3"><div><h3 className="text-sm font-bold text-slate-900">Qo‘shimcha xususiyatlar</h3><p className="mt-0.5 text-xs text-slate-500">Masalan: Quvvati — 2000 W</p></div><Button type="button" size="sm" variant="outline" onClick={addSpec}><Plus className="h-4 w-4" />Qator</Button></div>
              {draft.specs.map((row) => <div key={row.id} className="grid grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)_40px] gap-2"><Input aria-label="Xususiyat nomi" value={row.key} onChange={(event) => updateSpec(row.id, 'key', event.target.value)} placeholder="Xususiyat" /><Input aria-label="Xususiyat qiymati" value={row.value} onChange={(event) => updateSpec(row.id, 'value', event.target.value)} placeholder="Qiymati" /><button type="button" onClick={() => removeSpec(row.id)} aria-label="Xususiyatni o‘chirish" className="grid h-11 w-10 place-items-center rounded-md text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"><Trash2 className="h-4 w-4" /></button></div>)}
              {!draft.specs.length ? <p className="rounded-md bg-slate-50 px-4 py-3 text-xs text-slate-500">Qo‘shimcha xususiyat kiritilmagan.</p> : null}
            </div>
          </FormSection>

          {isDemoMode ? <Notice tone="warning">Demo rejimida formani ko‘rish mumkin, lekin bazaga yozish o‘chirilgan.</Notice> : null}
          {error ? <Notice tone="error">{error}</Notice> : null}
          {success ? <Notice tone="success">Mahsulot muvaffaqiyatli saqlandi.</Notice> : null}

          <footer className="sticky bottom-0 z-10 -mx-5 flex items-center justify-end gap-3 border-t border-slate-200 bg-white/95 px-5 py-4 backdrop-blur md:-mx-8 md:px-8">
            <Button type="button" variant="outline" onClick={onCancel} disabled={saving}>Bekor qilish</Button>
            <Button disabled={saving || isDemoMode || metaLoading}>{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <PackagePlus className="h-4 w-4" />}{saving ? (imageFile ? 'Rasm va mahsulot saqlanmoqda...' : 'Saqlanmoqda...') : product ? 'O‘zgarishlarni saqlash' : 'Mahsulot qo‘shish'}</Button>
          </footer>
        </form>
    </div>
  );
}

function FormSection({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return <section className="space-y-5 border-b border-slate-200 pb-8 last:border-0"><div><h2 className="text-base font-bold text-slate-950">{title}</h2><p className="mt-1 text-xs leading-5 text-slate-500">{description}</p></div>{children}</section>;
}

function Field({ label, hint, required, children }: { label: string; hint?: string; required?: boolean; children: ReactNode }) {
  return <label className="block"><span className="mb-2 flex items-center gap-1 text-sm font-semibold text-slate-700">{label}{required ? <span className="text-rose-600">*</span> : null}</span>{children}{hint ? <span className="mt-1.5 block text-[11px] text-slate-500">{hint}</span> : null}</label>;
}

function MoneyInput({ value, onChange, placeholder, required = false }: { value: string; onChange: (value: string) => void; placeholder: string; required?: boolean }) {
  return (
    <span className="relative block">
      <Input
        required={required}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        value={formatMoneyInput(value)}
        onChange={(event) => onChange(parseMoneyInput(event.target.value))}
        placeholder={placeholder}
        className="pr-14 tabular-nums"
      />
      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">so‘m</span>
    </span>
  );
}

function Notice({ tone, children }: { tone: 'error' | 'warning' | 'success'; children: ReactNode }) {
  const Icon = tone === 'success' ? CheckCircle2 : AlertCircle;
  return <div role="status" className={cn('flex items-start gap-2 rounded-md px-4 py-3 text-sm', tone === 'error' ? 'bg-rose-50 text-rose-700' : tone === 'warning' ? 'bg-amber-50 text-amber-800' : 'bg-emerald-50 text-emerald-700')}><Icon className="mt-0.5 h-4 w-4 shrink-0" />{children}</div>;
}

function productToDraft(product?: Product | null): Draft {
  const specs = product?.specs ?? {};
  const findSpec = (key: string) => Object.entries(specs).find(([name]) => name.toLocaleLowerCase('uz') === key)?.[1] ?? '';
  const extraSpecs = Object.entries(specs)
    .filter(([key]) => !knownSpecKeys.includes(key.toLocaleLowerCase('uz')))
    .map(([key, value], index) => ({ id: `saved-${index}`, key, value }));
  return {
    name: product?.name ?? '',
    slug: product?.slug ?? '',
    description: product?.description ?? '',
    price: product ? String(Number(product.price)) : '',
    discountPrice: product?.discountPrice ? String(Number(product.discountPrice)) : '',
    stock: product ? String(product.stock) : '0',
    imageUrl: product?.images[0]?.url ?? '',
    categoryId: product?.category.id ?? '',
    brandId: product?.brand.id ?? '',
    warranty: findSpec('kafolat') || '12 oy',
    model: findSpec('model'),
    color: findSpec('rang'),
    country: findSpec('ishlab chiqarilgan davlat'),
    unit: findSpec('o‘lchov birligi') || 'dona',
    specs: extraSpecs.length ? extraSpecs : [{ id: 'new-1', key: 'Quvvati', value: '' }]
  };
}

function createRowId() {
  return `spec-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function uniqueOptions(items: Array<{ id: string; name: string }>) {
  return Array.from(new Map(items.map((item) => [item.id, { id: item.id, name: item.name }])).values());
}

function parseMoneyInput(value: string) {
  return value.replace(/\D/g, '').replace(/^0+(?=\d)/, '').slice(0, 15);
}

function formatMoneyInput(value: string) {
  const digits = parseMoneyInput(value);
  return digits ? digits.replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : '';
}

function toSlug(value: string) {
  return value.toLocaleLowerCase('uz').replace(/[ʻʼ‘’']/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}
