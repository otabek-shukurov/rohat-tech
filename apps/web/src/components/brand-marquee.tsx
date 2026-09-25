const brands = ['Samsung', 'LG', 'Bosch', 'Artel', 'Shivaki', 'Haier', 'Midea', 'Xiaomi'];

export function BrandMarquee() {
  return (
    <section className="brand-marquee overflow-hidden border-y border-slate-200 bg-white py-7" aria-label="Hamkor brendlar">
      <p className="mb-5 text-center text-xs font-semibold uppercase text-slate-500">Ishonchli brendlar bir joyda</p>
      <div className="brand-track flex items-center">
        {[0, 1].map((copy) => (
          <div key={copy} className="flex shrink-0 items-center" aria-hidden={copy === 1}>
            {brands.map((brand) => (
              <div key={`${copy}-${brand}`} className="flex items-center">
                <span className="px-8 text-2xl font-semibold text-slate-800 sm:px-12 sm:text-3xl">{brand}</span>
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
