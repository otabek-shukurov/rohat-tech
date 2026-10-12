import { cn } from '@/lib/utils';

type ProductImageProps = {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
};

export function ProductImage({ src, alt, className, priority = false }: ProductImageProps) {
  return <img src={src} alt={alt} loading={priority ? 'eager' : 'lazy'} decoding="async" className={cn('absolute inset-0 h-full w-full', className)} />;
}
