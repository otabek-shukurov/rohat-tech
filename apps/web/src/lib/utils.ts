import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(value: number | string) {
  const amount = Math.round(Number(value));
  return `${String(amount).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} so‘m`;
}
