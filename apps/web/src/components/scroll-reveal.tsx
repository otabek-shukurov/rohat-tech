'use client';

import { type ReactNode, useEffect, useRef, useState } from 'react';

type ScrollRevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  variant?: 'rise' | 'scale' | 'left' | 'right';
};

const hiddenClasses = {
  rise: 'translate-y-8 scale-[0.985]',
  scale: 'translate-y-5 scale-[0.94]',
  left: '-translate-x-8',
  right: 'translate-x-8'
};

export function ScrollReveal({ children, className = '', delay = 0, variant = 'rise' }: ScrollRevealProps) {
  const elementRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -24px' }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={elementRef}
      className={`motion-safe:transition-[opacity,transform,filter] motion-safe:duration-700 motion-safe:ease-[cubic-bezier(0.22,1,0.36,1)] ${isVisible ? 'translate-x-0 translate-y-0 scale-100 opacity-100 blur-0' : `${hiddenClasses[variant]} opacity-0 blur-[5px]`} ${className}`}
      style={{ transitionDelay: isVisible ? `${delay}ms` : '0ms' }}
    >
      {children}
    </div>
  );
}
