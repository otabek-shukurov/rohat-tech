'use client';

import { type CSSProperties, type ReactNode, useEffect, useRef, useState } from 'react';

type ScrollRevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  variant?: 'rise' | 'scale' | 'left' | 'right';
  style?: CSSProperties;
};

const hiddenClasses = {
  rise: 'scroll-reveal--rise',
  scale: 'scroll-reveal--scale',
  left: 'scroll-reveal--left',
  right: 'scroll-reveal--right'
};

export function ScrollReveal({ children, className = '', delay = 0, variant = 'rise', style }: ScrollRevealProps) {
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
      { threshold: 0.08, rootMargin: '0px 0px -8%' }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={elementRef}
      className={`scroll-reveal ${hiddenClasses[variant]} ${isVisible ? 'scroll-reveal--visible' : ''} ${className}`}
      style={{ ...style, transitionDelay: isVisible ? `${delay}ms` : '0ms' }}
    >
      {children}
    </div>
  );
}
