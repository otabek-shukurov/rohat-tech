import Link from 'next/link';
import { type LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function EmptyState({ icon: Icon, title, description, href = '/catalog', action = 'Katalogni ko‘rish' }: { icon: LucideIcon; title: string; description: string; href?: string; action?: string }) {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
      <span className="grid h-12 w-12 place-items-center rounded-lg bg-blue-50 text-blue-700"><Icon className="h-6 w-6" /></span>
      <h2 className="mt-4 text-lg font-semibold text-slate-950">{title}</h2>
      <p className="mt-1 max-w-md text-sm leading-6 text-slate-500">{description}</p>
      <Button asChild className="mt-5"><Link href={href}>{action}</Link></Button>
    </div>
  );
}
