'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/lib/api';
import { formatPrice } from '@/lib/utils';

type Order = {
  id: string;
  orderNumber: string;
  status: string;
  total: string;
  deliveryMethod: string;
  user: { name: string; phone?: string; email: string };
  items: Array<{ id: string; productName: string; quantity: number }>;
};

const statuses = ['PENDING', 'CONFIRMED', 'PROCESSING', 'READY', 'DELIVERING', 'COMPLETED', 'CANCELLED'];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const load = () => api<Order[]>('/admin/orders').then(setOrders);

  useEffect(() => {
    load();
  }, []);

  async function update(id: string, status: string) {
    await api(`/admin/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
    load();
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-5 text-3xl font-bold">Buyurtmalarni boshqarish</h1>
      <div className="space-y-4">
        {orders.map((order) => (
          <Card key={order.id}>
            <CardHeader className="flex flex-row items-center justify-between gap-3">
              <div>
                <CardTitle>{order.orderNumber}</CardTitle>
                <p className="text-sm text-muted-foreground">{order.user.name} · {order.user.phone ?? order.user.email}</p>
              </div>
              <strong>{formatPrice(order.total)}</strong>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {statuses.map((status) => (
                  <Button key={status} size="sm" variant={order.status === status ? 'default' : 'outline'} onClick={() => update(order.id, status)}>
                    {status}
                  </Button>
                ))}
              </div>
              <div className="grid gap-2 text-sm md:grid-cols-2">
                {order.items.map((item) => <p key={item.id}>{item.productName} x {item.quantity}</p>)}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
