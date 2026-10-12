'use client';

import { useEffect, useState } from 'react';
import { Banknote, RotateCcw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/lib/api';
import { formatPrice } from '@/lib/utils';

type Report = {
  byStatus: Array<{ status: string; _count: { id: number } }>;
  sales: { count: number; revenue: number };
  returns: { count: number; revenue: number };
};

export default function ReportsPage() {
  const [report, setReport] = useState<Report | null>(null);

  useEffect(() => {
    api<Report>('/admin/reports').then(setReport);
  }, []);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-5 text-3xl font-bold">Hisobotlar</h1>
      <div className="mb-4 grid gap-4 md:grid-cols-2">
        <Card className="border-emerald-200 bg-emerald-50">
          <CardHeader><CardTitle className="flex items-center gap-2"><Banknote className="h-5 w-5" />Haqiqiy sotuvlar</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-emerald-800">Pul olingan, qaytarilmagan buyurtmalar: {report?.sales.count ?? 0}</p>
            <p className="mt-2 text-2xl font-bold text-emerald-950">{formatPrice(report?.sales.revenue ?? 0)}</p>
          </CardContent>
        </Card>
        <Card className="border-rose-200 bg-rose-50">
          <CardHeader><CardTitle className="flex items-center gap-2"><RotateCcw className="h-5 w-5" />Qaytarilganlar</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-rose-800">Qaytarilgan buyurtmalar: {report?.returns.count ?? 0}</p>
            <p className="mt-2 text-2xl font-bold text-rose-950">{formatPrice(report?.returns.revenue ?? 0)}</p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {report?.byStatus.map((row) => (
          <Card key={row.status}>
            <CardHeader><CardTitle>{row.status}</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Buyurtmalar: {row._count.id}</p>
              <p className="mt-2 text-xs text-slate-500">Tushum faqat yuqoridagi to‘langan sotuvlarda hisoblanadi.</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
