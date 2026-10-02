import { demoProducts } from '@/lib/demo-catalog';

export type AdminOrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'READY'
  | 'DELIVERING'
  | 'COMPLETED'
  | 'CANCELLED';

export type AdminOrderItem = {
  id: string;
  productName: string;
  quantity: number;
  unitPrice: number;
};

export type AdminOrder = {
  id: string;
  orderNumber: string;
  status: AdminOrderStatus;
  createdAt: string;
  deliveryMethod: 'Yetkazib berish' | 'Magazindan olib ketish';
  address: string;
  customer: { name: string; phone: string };
  items: AdminOrderItem[];
  total: number;
};

export const adminOrderStatuses: Array<{ value: AdminOrderStatus; label: string }> = [
  { value: 'PENDING', label: 'Yangi' },
  { value: 'CONFIRMED', label: 'Tasdiqlangan' },
  { value: 'PROCESSING', label: 'Tayyorlanmoqda' },
  { value: 'READY', label: 'Tayyor' },
  { value: 'DELIVERING', label: 'Yo‘lda' },
  { value: 'COMPLETED', label: 'Yakunlangan' },
  { value: 'CANCELLED', label: 'Bekor qilingan' }
];

export const demoAdminOrders: AdminOrder[] = [
  createOrder('127', 'PENDING', '2026-10-02T13:42:00+05:00', 'Jasur Hamroyev', '+998 90 527 14 28', 'Yetkazib berish', 'Vobkent, G‘ijduvon ko‘chasi 18', [
    ['samsung-no-frost-345l', 'Samsung No Frost 345L', 1, 8190000]
  ]),
  createOrder('126', 'CONFIRMED', '2026-10-02T12:18:00+05:00', 'Dilnoza Qodirova', '+998 93 614 08 42', 'Yetkazib berish', 'Vobkent, Mustaqillik ko‘chasi 7', [
    ['philips-hd9350', 'Philips HD9350 1.7L', 1, 699000],
    ['tefal-toaster', 'Tefal Includeo Toaster', 1, 699000]
  ]),
  createOrder('125', 'PROCESSING', '2026-10-02T10:55:00+05:00', 'Sarvar Alimov', '+998 91 450 33 27', 'Magazindan olib ketish', 'Rohat Tech, Vobkent filiali', [
    ['lenovo-ideapad-slim-3', 'Lenovo IdeaPad Slim 3 15', 1, 6490000]
  ]),
  createOrder('124', 'READY', '2026-10-01T18:27:00+05:00', 'Malika Rasulova', '+998 95 110 62 90', 'Yetkazib berish', 'Vobkent, Buxoro ko‘chasi 41', [
    ['artel-milagro-01-g', 'Artel Milagro 01-G', 1, 3990000]
  ]),
  createOrder('123', 'DELIVERING', '2026-10-01T16:04:00+05:00', 'Shahzod Karimov', '+998 99 782 19 54', 'Yetkazib berish', 'Vobkent, Navoiy mahallasi 12', [
    ['lg-inverter-8kg', 'LG Inverter Direct Drive 8kg', 1, 5690000]
  ]),
  createOrder('122', 'COMPLETED', '2026-10-01T11:36:00+05:00', 'Nodira Ergasheva', '+998 88 320 77 15', 'Yetkazib berish', 'Vobkent, Istiqlol ko‘chasi 23', [
    ['artel-smart-tv-55', 'Artel Smart TV 55 4K UHD', 1, 5990000],
    ['xiaomi-smart-fan', 'Xiaomi Smart Standing Fan 2', 1, 1190000]
  ]),
  createOrder('121', 'COMPLETED', '2026-09-30T15:20:00+05:00', 'Asadbek Jo‘rayev', '+998 90 705 44 81', 'Magazindan olib ketish', 'Rohat Tech, Vobkent filiali', [
    ['bosch-climate-3000i-12', 'Bosch Climate 3000i 12', 1, 7290000]
  ]),
  createOrder('120', 'CANCELLED', '2026-09-30T09:48:00+05:00', 'Mohira Safarova', '+998 97 230 16 68', 'Yetkazib berish', 'Vobkent, Do‘stlik ko‘chasi 5', [
    ['midea-air-fryer', 'Midea Air Fryer 5.5L', 1, 1490000]
  ])
];

export const weeklySales = [
  { label: 'Du', value: 8200000 },
  { label: 'Se', value: 12400000 },
  { label: 'Ch', value: 9800000 },
  { label: 'Pa', value: 15800000 },
  { label: 'Ju', value: 13200000 },
  { label: 'Sh', value: 18400000 },
  { label: 'Ya', value: 14600000 }
];

const storageKey = 'rohat_admin_orders_v1';

export function loadAdminOrders(): AdminOrder[] {
  if (typeof window === 'undefined') return demoAdminOrders;
  try {
    const saved = window.localStorage.getItem(storageKey);
    return saved ? (JSON.parse(saved) as AdminOrder[]) : demoAdminOrders;
  } catch {
    return demoAdminOrders;
  }
}

export function saveAdminOrders(orders: AdminOrder[]) {
  window.localStorage.setItem(storageKey, JSON.stringify(orders));
  window.dispatchEvent(new CustomEvent('rohat:admin-orders'));
}

export function updateAdminOrderStatus(id: string, status: AdminOrderStatus) {
  const orders = loadAdminOrders().map((order) => (order.id === id ? { ...order, status } : order));
  saveAdminOrders(orders);
  return orders;
}

export function getAdminMetrics(orders: AdminOrder[]) {
  const activeOrders = orders.filter((order) => !['COMPLETED', 'CANCELLED'].includes(order.status));
  const revenue = orders.filter((order) => order.status !== 'CANCELLED').reduce((sum, order) => sum + order.total, 0);
  const customers = new Set(orders.map((order) => order.customer.phone)).size;
  return { orders: orders.length, activeOrders: activeOrders.length, products: demoProducts.length, customers, revenue };
}

export const lowStockProducts = demoProducts
  .filter((product) => product.stock <= 7)
  .sort((a, b) => a.stock - b.stock)
  .slice(0, 6);

export function getStatusLabel(status: AdminOrderStatus) {
  return adminOrderStatuses.find((item) => item.value === status)?.label ?? status;
}

export function formatAdminOrderDate(value: string) {
  const tashkentTime = new Date(new Date(value).getTime() + 5 * 60 * 60 * 1000);
  const day = String(tashkentTime.getUTCDate()).padStart(2, '0');
  const month = String(tashkentTime.getUTCMonth() + 1).padStart(2, '0');
  const hour = String(tashkentTime.getUTCHours()).padStart(2, '0');
  const minute = String(tashkentTime.getUTCMinutes()).padStart(2, '0');
  return `${day}.${month}, ${hour}:${minute}`;
}

function createOrder(
  number: string,
  status: AdminOrderStatus,
  createdAt: string,
  name: string,
  phone: string,
  deliveryMethod: AdminOrder['deliveryMethod'],
  address: string,
  items: Array<[string, string, number, number]>
): AdminOrder {
  const normalizedItems = items.map(([id, productName, quantity, unitPrice]) => ({ id, productName, quantity, unitPrice }));
  return {
    id: `order-${number}`,
    orderNumber: `RT-${number.padStart(6, '0')}`,
    status,
    createdAt,
    deliveryMethod,
    address,
    customer: { name, phone },
    items: normalizedItems,
    total: normalizedItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
  };
}
