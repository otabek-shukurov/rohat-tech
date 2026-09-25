import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const image = (seed: string) =>
  `https://images.unsplash.com/${seed}?auto=format&fit=crop&w=1200&q=80`;

async function main() {
  const [adminPassword, customerPassword] = await Promise.all([
    bcrypt.hash('Admin12345', 10),
    bcrypt.hash('Mijoz12345', 10)
  ]);

  await prisma.user.upsert({
    where: { email: 'admin@rohat.tech' },
    update: {},
    create: {
      name: 'Rohat Admin',
      email: 'admin@rohat.tech',
      phone: '+998901112233',
      role: Role.ADMIN,
      password: adminPassword
    }
  });

  await prisma.user.upsert({
    where: { email: 'mijoz@rohat.tech' },
    update: {},
    create: {
      name: 'Demo Mijoz',
      email: 'mijoz@rohat.tech',
      phone: '+998901234567',
      address: 'Toshkent shahri, Chilonzor tumani',
      password: customerPassword
    }
  });

  const categories = await Promise.all(
    [
      ['Sovutgichlar', 'sovutgichlar'],
      ['Kir yuvish mashinalari', 'kir-yuvish-mashinalari'],
      ['Televizorlar', 'televizorlar'],
      ['Konditsionerlar', 'konditsionerlar']
    ].map(([name, slug]) =>
      prisma.category.upsert({
        where: { slug },
        update: {},
        create: { name, slug }
      })
    )
  );

  const brands = await Promise.all(
    [
      ['Samsung', 'samsung'],
      ['LG', 'lg'],
      ['Artel', 'artel'],
      ['Bosch', 'bosch']
    ].map(([name, slug]) =>
      prisma.brand.upsert({
        where: { slug },
        update: {},
        create: { name, slug }
      })
    )
  );

  const productSeeds = [
    {
      name: 'Samsung No Frost 345L',
      slug: 'samsung-no-frost-345l',
      category: categories[0],
      brand: brands[0],
      price: 8790000,
      discountPrice: 8190000,
      stock: 12,
      image: image('photo-1571175443880-49e1d25b2bc5')
    },
    {
      name: 'LG Inverter 8kg',
      slug: 'lg-inverter-8kg',
      category: categories[1],
      brand: brands[1],
      price: 5690000,
      discountPrice: null,
      stock: 18,
      image: image('photo-1626806787461-102c1bfaaea1')
    },
    {
      name: 'Artel Smart TV 55"',
      slug: 'artel-smart-tv-55',
      category: categories[2],
      brand: brands[2],
      price: 6490000,
      discountPrice: 5990000,
      stock: 9,
      image: image('photo-1593359677879-a4bb92f829d1')
    },
    {
      name: 'Bosch Split 12 Inverter',
      slug: 'bosch-split-12-inverter',
      category: categories[3],
      brand: brands[3],
      price: 7290000,
      discountPrice: null,
      stock: 7,
      image: '/images/rohat-tech-hero.png'
    }
  ];

  for (const item of productSeeds) {
    await prisma.product.upsert({
      where: { slug: item.slug },
      update: {},
      create: {
        name: item.name,
        slug: item.slug,
        description:
          'Rohat Tech kafolati bilan zamonaviy, tejamkor va ishonchli maishiy texnika.',
        price: item.price,
        discountPrice: item.discountPrice,
        stock: item.stock,
        specs: {
          kafolat: '24 oy',
          yetkazibBerish: 'Toshkent bo‘yicha 1 kun',
          energiya: 'A++'
        },
        categoryId: item.category.id,
        brandId: item.brand.id,
        images: {
          create: [{ url: item.image, alt: item.name, position: 0 }]
        }
      }
    });
  }

  await prisma.promotion.upsert({
    where: { code: 'ROHAT10' },
    update: {},
    create: {
      title: 'Rohat Tech ochilish chegirmasi',
      code: 'ROHAT10',
      description: 'Tanlangan mahsulotlarga 10% gacha chegirma.',
      discountPct: 10,
      startsAt: new Date(),
      endsAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)
    }
  });
}

main()
  .finally(async () => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
