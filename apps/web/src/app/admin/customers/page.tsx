'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/lib/api';

type Customer = { id: string; name: string; email: string; phone?: string; createdAt: string };

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);

  useEffect(() => {
    api<Customer[]>('/admin/customers').then(setCustomers);
  }, []);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-5 text-3xl font-bold">Mijozlar</h1>
      <Card>
        <CardHeader><CardTitle>Ro‘yxatdan o‘tgan mijozlar</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {customers.map((customer) => (
            <div key={customer.id} className="grid gap-2 rounded-md border p-3 sm:grid-cols-3">
              <strong>{customer.name}</strong>
              <span>{customer.email}</span>
              <span className="text-muted-foreground">{customer.phone ?? 'Telefon yo‘q'}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
