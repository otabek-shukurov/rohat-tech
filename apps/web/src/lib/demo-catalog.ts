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
    { id: 'category-air', name: 'Konditsionerlar', slug: 'konditsionerlar' },
    { id: 'category-vacuum', name: 'Changyutgichlar', slug: 'changyutgichlar' },
    { id: 'category-blender', name: 'Blenderlar', slug: 'blenderlar' },
    { id: 'category-kettle', name: 'Elektr choynaklar', slug: 'elektr-choynaklar' },
    { id: 'category-cooler', name: 'Kulerlar', slug: 'kulerlar' },
    { id: 'category-laptop', name: 'Noutbuklar', slug: 'noutbuklar' },
    { id: 'category-iron', name: 'Dazmollar', slug: 'dazmollar' },
    { id: 'category-stove', name: 'Gaz plitalar', slug: 'gaz-plitalar' },
    { id: 'category-microwave', name: 'Mikroto‘lqinli pechlar', slug: 'mikrotolqinli-pechlar' },
    { id: 'category-kitchen', name: 'Oshxona jihozlari', slug: 'oshxona-jihozlari' },
    { id: 'category-other', name: 'Boshqa texnika', slug: 'boshqa-texnika' }
  ],
  brands: [
    { id: 'brand-samsung', name: 'Samsung', slug: 'samsung' },
    { id: 'brand-lg', name: 'LG', slug: 'lg' },
    { id: 'brand-artel', name: 'Artel', slug: 'artel' },
    { id: 'brand-bosch', name: 'Bosch', slug: 'bosch' },
    { id: 'brand-philips', name: 'Philips', slug: 'philips' },
    { id: 'brand-xiaomi', name: 'Xiaomi', slug: 'xiaomi' },
    { id: 'brand-lenovo', name: 'Lenovo', slug: 'lenovo' },
    { id: 'brand-hp', name: 'HP', slug: 'hp' },
    { id: 'brand-tefal', name: 'Tefal', slug: 'tefal' },
    { id: 'brand-beko', name: 'Beko', slug: 'beko' },
    { id: 'brand-midea', name: 'Midea', slug: 'midea' },
    { id: 'brand-shivaki', name: 'Shivaki', slug: 'shivaki' },
    { id: 'brand-avalon', name: 'Avalon', slug: 'avalon' }
  ]
};

const unsplash = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=82`;

export const demoCategoryVisuals: Record<string, string> = {
  sovutgichlar: '/images/hero-fridge.png',
  'kir-yuvish-mashinalari': '/images/hero-washer.png',
  televizorlar: '/images/hero-tv.png',
  konditsionerlar: '/images/rohat-tech-hero.png',
  changyutgichlar: unsplash('photo-1765824142352-7bd73ea117f2'),
  blenderlar: unsplash('photo-1727107463948-012b8867cbf6'),
  'elektr-choynaklar': unsplash('photo-1594706441212-4dec0bd64338'),
  kulerlar: unsplash('photo-1780590107766-28714e165924'),
  noutbuklar: unsplash('photo-1758611971270-89ce7ed506e1'),
  dazmollar: unsplash('photo-1574269910231-bc508bcb68ae'),
  'gaz-plitalar': unsplash('photo-1767771665869-51fab4d8c83b'),
  'mikrotolqinli-pechlar': unsplash('photo-1585659722983-3a675dabf23d'),
  'oshxona-jihozlari': unsplash('photo-1556911220-bff31c812dba'),
  'boshqa-texnika': unsplash('photo-1556228578-0d85b1a4d571')
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
  product('samsung-windfree-12', 'Samsung WindFree 12', 'konditsionerlar', 'samsung', 9490000, 5, '/images/rohat-tech-hero.png'),
  ...getAdditionalProductData().map(([id, name, category, brand, price, stock, discountPrice]) =>
    product(id, name, category, brand, price, stock, demoCategoryVisuals[category], discountPrice)
  )
];

type DemoProductData = [
  id: string,
  name: string,
  category: string,
  brand: string,
  price: number,
  stock: number,
  discountPrice?: number
];

function getAdditionalProductData(): DemoProductData[] {
  return [
  ['xiaomi-robot-vacuum-s10', 'Xiaomi Robot Vacuum S10', 'changyutgichlar', 'xiaomi', 4590000, 14, 4290000],
  ['philips-powerpro-fc9350', 'Philips PowerPro Compact FC9350', 'changyutgichlar', 'philips', 2490000, 18],
  ['bosch-serie-4-vacuum', 'Bosch Serie 4 ProPower', 'changyutgichlar', 'bosch', 3190000, 9],
  ['artel-vcc-0220', 'Artel VCC 0220 Cyclone', 'changyutgichlar', 'artel', 1390000, 22, 1190000],
  ['philips-hr2228', 'Philips Daily Collection HR2228', 'blenderlar', 'philips', 1290000, 17],
  ['bosch-vita-power', 'Bosch VitaPower Serie 4', 'blenderlar', 'bosch', 1890000, 8],
  ['tefal-blendforce-ii', 'Tefal Blendforce II', 'blenderlar', 'tefal', 1090000, 20, 949000],
  ['artel-blender-600w', 'Artel BL 600W', 'blenderlar', 'artel', 649000, 25],
  ['philips-hd9350', 'Philips HD9350 1.7L', 'elektr-choynaklar', 'philips', 699000, 28],
  ['bosch-twk3p420', 'Bosch TWK3P420 DesignLine', 'elektr-choynaklar', 'bosch', 849000, 16],
  ['tefal-ko260', 'Tefal Safe to Touch KO260', 'elektr-choynaklar', 'tefal', 599000, 19, 529000],
  ['artel-ke-2025', 'Artel KE 2025', 'elektr-choynaklar', 'artel', 349000, 34],
  ['midea-water-dispenser-yl1633', 'Midea YL1633S Water Dispenser', 'kulerlar', 'midea', 2190000, 11],
  ['artel-water-dispenser', 'Artel ART-WD 330', 'kulerlar', 'artel', 1790000, 15],
  ['avalon-a10', 'Avalon A10 Hot & Cold', 'kulerlar', 'avalon', 3490000, 7, 3190000],
  ['lenovo-ideapad-slim-3', 'Lenovo IdeaPad Slim 3 15', 'noutbuklar', 'lenovo', 6490000, 13],
  ['hp-pavilion-15', 'HP Pavilion 15 Core i5', 'noutbuklar', 'hp', 8990000, 9],
  ['samsung-galaxy-book4', 'Samsung Galaxy Book4', 'noutbuklar', 'samsung', 10490000, 6],
  ['lenovo-loq-15', 'Lenovo LOQ 15 Gaming', 'noutbuklar', 'lenovo', 12990000, 5, 11990000],
  ['hp-victus-16', 'HP Victus 16 RTX', 'noutbuklar', 'hp', 15490000, 4],
  ['philips-azur-8000', 'Philips Azur 8000 Series', 'dazmollar', 'philips', 1190000, 18],
  ['tefal-express-steam', 'Tefal Express Steam', 'dazmollar', 'tefal', 949000, 20, 849000],
  ['bosch-sensixx', 'Bosch Sensixx DA30', 'dazmollar', 'bosch', 799000, 14],
  ['beko-fsgt62110', 'Beko FSGT62110GX 4 konforka', 'gaz-plitalar', 'beko', 5990000, 7],
  ['artel-milagro-01-g', 'Artel Milagro 01-G', 'gaz-plitalar', 'artel', 4290000, 12, 3990000],
  ['midea-mcg-4qpi24', 'Midea MCG-4QPI24', 'gaz-plitalar', 'midea', 5490000, 8],
  ['shivaki-6401', 'Shivaki 6401 Gas Cooker', 'gaz-plitalar', 'shivaki', 3890000, 10],
  ['samsung-ms23k3513', 'Samsung MS23K3513AK 23L', 'mikrotolqinli-pechlar', 'samsung', 1890000, 17],
  ['lg-ms2042db', 'LG MS2042DB 20L', 'mikrotolqinli-pechlar', 'lg', 1990000, 13],
  ['artel-23mx39', 'Artel 23MX39 Grill', 'mikrotolqinli-pechlar', 'artel', 1390000, 21, 1249000],
  ['midea-am820', 'Midea AM820C2RA 20L', 'mikrotolqinli-pechlar', 'midea', 1590000, 16],
  ['bosch-multitalent-8', 'Bosch MultiTalent 8', 'oshxona-jihozlari', 'bosch', 2890000, 9],
  ['philips-food-processor', 'Philips Viva Food Processor', 'oshxona-jihozlari', 'philips', 1790000, 13],
  ['tefal-masterchef', 'Tefal Masterchef Gourmet', 'oshxona-jihozlari', 'tefal', 3490000, 6],
  ['artel-meat-grinder', 'Artel MG 1080 Go‘sht maydalagich', 'oshxona-jihozlari', 'artel', 1290000, 18],
  ['midea-air-fryer', 'Midea Air Fryer 5.5L', 'oshxona-jihozlari', 'midea', 1690000, 15, 1490000],
  ['philips-hair-dryer', 'Philips ThermoProtect Fen', 'boshqa-texnika', 'philips', 599000, 22],
  ['xiaomi-smart-fan', 'Xiaomi Smart Standing Fan 2', 'boshqa-texnika', 'xiaomi', 1190000, 12],
  ['tefal-toaster', 'Tefal Includeo Toaster', 'boshqa-texnika', 'tefal', 699000, 19],
    ['bosch-coffee-machine', 'Bosch VeroCafe Coffee Machine', 'boshqa-texnika', 'bosch', 2490000, 8]
  ];
}

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
