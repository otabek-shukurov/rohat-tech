const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';

export const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: string;
  discountPrice?: string | null;
  stock: number;
  specs?: Record<string, string>;
  category: { id: string; name: string; slug: string };
  brand: { id: string; name: string; slug: string };
  images: Array<{ id: string; url: string; alt?: string | null }>;
};

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: 'ADMIN' | 'CUSTOMER';
};

export function getToken() {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem('rohat_token');
}

export function setToken(token: string) {
  window.localStorage.setItem('rohat_token', token);
}

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    const res = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...init.headers
      },
      signal: init.signal ?? controller.signal,
      cache: 'no-store'
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: 'Server xatosi' }));
      throw new Error(Array.isArray(error.message) ? error.message[0] : error.message);
    }
    return res.json();
  } finally {
    clearTimeout(timeout);
  }
}
