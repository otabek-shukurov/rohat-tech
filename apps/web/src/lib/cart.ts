'use client';

import type { Product } from '@/lib/api';

const CART_STORAGE_KEY = 'rohat_cart_v1';
export const CART_CHANGE_EVENT = 'rohat:cartchange';

export type CartItem = {
  product: Product;
  quantity: number;
};

export function getCartItems(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const value = JSON.parse(window.localStorage.getItem(CART_STORAGE_KEY) ?? '[]');
    if (!Array.isArray(value)) return [];
    return value.filter(isCartItem);
  } catch {
    return [];
  }
}

export function addCartItem(product: Product, quantity = 1) {
  const items = getCartItems();
  const existing = items.find((item) => item.product.id === product.id);
  if (existing) {
    existing.product = product;
    existing.quantity = Math.min(product.stock, existing.quantity + quantity);
  } else {
    items.unshift({ product, quantity: Math.min(product.stock, Math.max(1, quantity)) });
  }
  saveCartItems(items);
  return items;
}

export function updateCartItem(productId: string, quantity: number) {
  const items = getCartItems().map((item) => item.product.id === productId
    ? { ...item, quantity: Math.min(item.product.stock, Math.max(1, quantity)) }
    : item);
  saveCartItems(items);
  return items;
}

export function removeCartItem(productId: string) {
  const items = getCartItems().filter((item) => item.product.id !== productId);
  saveCartItems(items);
  return items;
}

export function clearCart() {
  saveCartItems([]);
}

export function getCartCount(items = getCartItems()) {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

export function getCartSubtotal(items = getCartItems()) {
  return items.reduce((sum, item) => sum + Number(item.product.discountPrice ?? item.product.price) * item.quantity, 0);
}

function saveCartItems(items: CartItem[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent(CART_CHANGE_EVENT));
}

function isCartItem(value: unknown): value is CartItem {
  if (!value || typeof value !== 'object') return false;
  const item = value as Partial<CartItem>;
  return Boolean(item.product?.id && Number.isInteger(item.quantity) && Number(item.quantity) > 0);
}
