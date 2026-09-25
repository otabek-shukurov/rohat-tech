import type { Product } from '@/lib/api';

export type CatalogMeta = {
  categories: Array<{ id: string; name: string; slug: string }>;
  brands: Array<{ id: string; name: string; slug: string }>;
};

export const demoCatalogMeta: CatalogMeta = {
  categories: [
    { id: 'category-fridge', name: 'Sovutgichlar', slug: 'sovutgichlar' },
    { id: 'category-washer', name: 'Kir yuvish mashinalari', slug: 'kir-yuvish-mashinalari' },
    { id: 'category-tv', name: 'Televizorlar', slug: 'televizorlar' },
    { id: 'category-air', name: 'Konditsionerlar', slug: 'konditsionerlar' }
  ],
  brands: [
    { id: 'brand-samsung', name: 'Samsung', slug: 'samsung' },
    { id: 'brand-lg', name: 'LG', slug: 'lg' },
    { id: 'brand-artel', name: 'Artel', slug: 'artel' },
    { id: 'brand-bosch', name: 'Bosch', slug: 'bosch' }
  ]
};

const categoryBySlug = Object.fromEntries(demoCatalogMeta.categories.map((item) => [item.slug, item]));
const brandBySlug = Object.fromEntries(demoCatalogMeta.brands.map((item) => [item.slug, item]));

function product(
  id: string,
  name: string,
  category: string,
  brand: string,
  price: number,
  stock: number,
  image: string,
  discountPrice?: number
): Product {
  return {
    id,
    name,
    slug: id,
    description: 'Rohat Tech kafolati bilan energiya tejamkor, ishonchli va zamonaviy maishiy texnika.',
    price: String(price),
    discountPrice: discountPrice ? String(discountPrice) : null,
    stock,
    specs: {
      Kafolat: '24 oy',
      'Yetkazib berish': 'Vobkent bo‘ylab bepul',
      'Energiya samaradorligi': 'A++'
    },
    category: categoryBySlug[category],
    brand: brandBySlug[brand],
    images: [{ id: `${id}-image`, url: image, alt: name }]
  };
}

export const demoProducts: Product[] = [
  product('samsung-no-frost-345l', 'Samsung No Frost 345L', 'sovutgichlar', 'samsung', 8790000, 12, '/images/hero-fridge.png', 8190000),
  product('lg-doorcooling-509l', 'LG DoorCooling+ 509L', 'sovutgichlar', 'lg', 12990000, 7, '/images/hero-fridge.png'),
  product('artel-hd-455rw', 'Artel HD 455RW Inverter', 'sovutgichlar', 'artel', 6990000, 15, '/images/hero-fridge.png', 6490000),
  product('lg-inverter-8kg', 'LG Inverter Direct Drive 8kg', 'kir-yuvish-mashinalari', 'lg', 5690000, 18, '/images/hero-washer.png'),
  product('samsung-ecobubble-9kg', 'Samsung EcoBubble 9kg', 'kir-yuvish-mashinalari', 'samsung', 7490000, 10, '/images/hero-washer.png', 6990000),
  product('bosch-serie-6-9kg', 'Bosch Serie 6 9kg', 'kir-yuvish-mashinalari', 'bosch', 8390000, 6, '/images/hero-washer.png'),
  product('artel-smart-tv-55', 'Artel Smart TV 55 4K UHD', 'televizorlar', 'artel', 6490000, 9, '/images/hero-tv.png', 5990000),
  product('samsung-crystal-uhd-65', 'Samsung Crystal UHD 65', 'televizorlar', 'samsung', 10490000, 5, '/images/hero-tv.png'),
  product('lg-oled-evo-c3-55', 'LG OLED evo C3 55', 'televizorlar', 'lg', 17990000, 4, '/images/hero-tv.png', 16490000),
  product('bosch-climate-3000i-12', 'Bosch Climate 3000i 12', 'konditsionerlar', 'bosch', 7290000, 7, '/images/rohat-tech-hero.png'),
  product('artel-inverter-12', 'Artel Shahrisabz Inverter 12', 'konditsionerlar', 'artel', 5990000, 13, '/images/rohat-tech-hero.png', 5490000),
  product('samsung-windfree-12', 'Samsung WindFree 12', 'konditsionerlar', 'samsung', 9490000, 5, '/images/rohat-tech-hero.png')
];

export function filterDemoProducts(filters: { q?: string; category?: string; brand?: string; discountOnly?: boolean }) {
  const search = filters.q?.trim().toLocaleLowerCase('uz') ?? '';

  return demoProducts.filter((item) => {
    const matchesSearch = !search || `${item.name} ${item.category.name} ${item.brand.name}`.toLocaleLowerCase('uz').includes(search);
    const matchesCategory = !filters.category || item.category.slug === filters.category;
    const matchesBrand = !filters.brand || item.brand.slug === filters.brand;
    const matchesDiscount = !filters.discountOnly || Boolean(item.discountPrice);
    return matchesSearch && matchesCategory && matchesBrand && matchesDiscount;
  });
}

export function findDemoProduct(slug: string) {
  return demoProducts.find((item) => item.slug === slug) ?? null;
}
