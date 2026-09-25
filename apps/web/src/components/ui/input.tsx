import * as React from 'react';
import { cn } from '@/lib/utils';

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      className={cn(
        'flex h-11 w-full rounded-md border border-slate-300 bg-white px-3.5 py-2 text-sm outline-none ring-offset-background transition-[border-color,box-shadow] placeholder:text-slate-400 focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:opacity-60',
        className
      )}
      ref={ref}
      {...props}
    />
  )
);
Input.displayName = 'Input';
