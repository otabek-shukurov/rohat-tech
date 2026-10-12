import { type AdminOrderStatus, getStatusLabel } from '@/lib/admin-demo';
import { cn } from '@/lib/utils';

const tones: Record<AdminOrderStatus, string> = {
  NEW: 'border-blue-200 bg-blue-50 text-blue-700',
  SOLD: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  RETURNED: 'border-rose-200 bg-rose-50 text-rose-700'
};

export function OrderStatusBadge({ status, className }: { status: AdminOrderStatus; className?: string }) {
  return (
    <span className={cn('inline-flex min-h-7 items-center rounded-full border px-2.5 text-xs font-semibold', tones[status], className)}>
      {getStatusLabel(status)}
    </span>
  );
}
