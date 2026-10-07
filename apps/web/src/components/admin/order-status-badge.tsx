import { type AdminOrderStatus, getStatusLabel } from '@/lib/admin-demo';
import { cn } from '@/lib/utils';

const tones: Record<AdminOrderStatus, string> = {
  PENDING: 'border-amber-200 bg-amber-50 text-amber-700',
  CONFIRMED: 'border-blue-200 bg-blue-50 text-blue-700',
  PROCESSING: 'border-violet-200 bg-violet-50 text-violet-700',
  READY: 'border-cyan-200 bg-cyan-50 text-cyan-700',
  DELIVERING: 'border-indigo-200 bg-indigo-50 text-indigo-700',
  COMPLETED: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  CANCELLED: 'border-rose-200 bg-rose-50 text-rose-700'
};

export function OrderStatusBadge({ status, className }: { status: AdminOrderStatus; className?: string }) {
  return (
    <span className={cn('inline-flex min-h-7 items-center rounded-full border px-2.5 text-xs font-semibold', tones[status], className)}>
      {getStatusLabel(status)}
    </span>
  );
}
