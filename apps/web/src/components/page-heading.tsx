import Link from 'next/link';
import { type ReactNode } from 'react';

export function PageHeading({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 sm:flex-row sm:items-end sm:justify-between md:px-5 md:py-10">
        <div>
          <div className="text-xs font-medium text-slate-500"><Link href="/" className="hover:text-blue-700">Bosh sahifa</Link> <span className="px-1.5">/</span> {title}</div>
          <h1 className="mt-3 text-3xl font-bold text-slate-950 md:text-4xl">{title}</h1>
          {description ? <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{description}</p> : null}
        </div>
        {action}
      </div>
    </div>
  );
}
