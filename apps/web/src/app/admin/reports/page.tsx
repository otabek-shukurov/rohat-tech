'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/lib/api';
import { formatPrice } from '@/lib/utils';

type Report = {
  byStatus: Array<{ status: string; _count: { id: number }; _sum: { total: string | null } }>;
};

export default function ReportsPage() {
  const [report, setReport] = useState<Report | null>(null);

  useEffect(() => {
    api<Report>('/admin/reports').then(setReport);
  }, []);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-5 text-3xl font-bold">Hisobotlar</h1>
      <div className="grid gap-4 md:grid-cols-2">
        {report?.byStatus.map((row) => (
          <Card key={row.status}>
            <CardHeader><CardTitle>{row.status}</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Buyurtmalar: {row._count.id}</p>
              <p className="mt-2 text-xl font-bold text-blue-700">{formatPrice(row._sum.total ?? 0)}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
