// Typed client for the Foodie backend API.
//
// Set EXPO_PUBLIC_API_URL to the machine running the backend, e.g.
//   EXPO_PUBLIC_API_URL=http://192.168.1.5:4000 npx expo start
// Falls back to localhost (works for simulators on the same machine).
import * as SecureStore from 'expo-secure-store';

export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:4000';

const TOKEN_KEY = 'foodie_jwt';

export async function getToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  } catch {
    return null;
  }
}

export async function setToken(token: string | null): Promise<void> {
  try {
    if (token) await SecureStore.setItemAsync(TOKEN_KEY, token);
    else await SecureStore.deleteItemAsync(TOKEN_KEY);
  } catch {
    // SecureStore unavailable (e.g. web) — token stays in memory only.
  }
}

// ---------------------------------------------------------------- types ---

export type ApiRole = 'CUSTOMER' | 'MAKER' | 'ADMIN';
export type ApiOrderStatus = 'NEW' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

export interface ApiUser {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  avatarUrl: string | null;
  role: ApiRole;
  createdAt: string;
}

export interface ApiKitchen {
  id: string;
  ownerId: string;
  name: string;
  about: string;
  location: string;
  avatarUrl: string | null;
  bannerUrl: string | null;
  verified: boolean;
  rating: number;
  reviewCount: number;
  followerCount: number;
  isActive: boolean;
  createdAt: string;
}

export interface ApiKitchenSummary {
  id: string;
  name: string;
  avatarUrl: string | null;
  rating: number;
  reviewCount: number;
  location: string;
  verified: boolean;
}

export interface ApiDish {
  id: string;
  kitchenId: string;
  name: string;
  description: string;
  priceCents: number;
  category: string;
  tags: string;
  portion: string;
  quantityTotal: number;
  quantityLeft: number;
  pickupStart: string;
  pickupEnd: string;
  imageUrl: string | null;
  isActive: boolean;
  createdAt: string;
  kitchen?: ApiKitchenSummary;
}

export interface ApiOrderItem {
  id: string;
  orderId: string;
  dishId: string;
  nameSnapshot: string;
  priceCentsSnapshot: number;
  qty: number;
}

export interface ApiOrder {
  id: string;
  customerId: string;
  kitchenId: string;
  status: ApiOrderStatus;
  subtotalCents: number;
  serviceFeeCents: number;
  totalCents: number;
  paymentMethod: string;
  pickupSlot: string;
  createdAt: string;
  items: ApiOrderItem[];
  kitchen?: { id: string; name: string; avatarUrl: string | null; location: string };
  customer?: { id: string; name: string };
}

export interface ApiReview {
  id: string;
  orderId: string;
  overall: number;
  quality: number;
  packaging: number;
  accuracy: number;
  comment: string;
  createdAt: string;
  customer?: { name: string };
}

export interface ApiEarnings {
  summary: {
    grossCents: number;
    commissionCents: number;
    tipsCents: number;
    netCents: number;
    commissionRate: number;
  };
  weekly: { week: string; grossCents: number }[];
  payouts: unknown[];
}

export interface ApiDashboard {
  todaySalesCents: number;
  orderCount: number;
  foodRemaining: number;
}

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

// --------------------------------------------------------------- client ---

let memoryToken: string | null = null;

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = memoryToken ?? (await getToken());
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init.headers ?? {}),
    },
  });
  const text = await res.text();
  const body = text ? (JSON.parse(text) as unknown) : null;
  if (!res.ok) {
    const message =
      body && typeof body === 'object' && 'error' in body && typeof body.error === 'string'
        ? body.error
        : `Request failed (${res.status})`;
    throw new ApiError(res.status, message);
  }
  return body as T;
}

export const api = {
  // -- auth -------------------------------------------------------------
  async signup(input: { name: string; email: string; password: string; role: ApiRole }) {
    const r = await request<{ token: string; user: ApiUser }>('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(input),
    });
    memoryToken = r.token;
    await setToken(r.token);
    return r;
  },
  async login(email: string, password: string) {
    const r = await request<{ token: string; user: ApiUser }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    memoryToken = r.token;
    await setToken(r.token);
    return r;
  },
  async logout() {
    memoryToken = null;
    await setToken(null);
  },
  me() {
    return request<{ user: ApiUser }>('/api/auth/me');
  },

  // -- dishes & kitchens ------------------------------------------------
  listDishes(params: { category?: string; search?: string; limit?: number } = {}) {
    const q = new URLSearchParams();
    if (params.category && params.category !== 'all') q.set('category', params.category);
    if (params.search) q.set('search', params.search);
    q.set('limit', String(params.limit ?? 50));
    return request<{ data: ApiDish[]; page: number; limit: number; total: number }>(
      `/api/dishes?${q.toString()}`,
    );
  },
  getDish(id: string) {
    return request<ApiDish>(`/api/dishes/${encodeURIComponent(id)}`);
  },
  listKitchens() {
    return request<{ data: ApiKitchen[] }>('/api/kitchens');
  },
  getKitchen(id: string) {
    return request<ApiKitchen & { dishes: ApiDish[]; reviews: ApiReview[] }>(
      `/api/kitchens/${encodeURIComponent(id)}`,
    );
  },
  followKitchen(id: string) {
    return request<{ following: boolean }>(`/api/kitchens/${encodeURIComponent(id)}/follow`, {
      method: 'POST',
    });
  },
  unfollowKitchen(id: string) {
    return request<{ following: boolean }>(`/api/kitchens/${encodeURIComponent(id)}/follow`, {
      method: 'DELETE',
    });
  },

  // -- orders -----------------------------------------------------------
  createOrder(input: {
    items: { dishId: string; qty: number }[];
    paymentMethod: string;
    pickupSlot: string;
  }) {
    return request<{ order: ApiOrder; paymentIntent: unknown }>('/api/orders', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },
  myOrders() {
    return request<ApiOrder[]>('/api/orders/mine');
  },
  reviewOrder(
    id: string,
    input: { overall: number; quality: number; packaging: number; accuracy: number; comment?: string },
  ) {
    return request<ApiReview>(`/api/orders/${encodeURIComponent(id)}/review`, {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  // -- maker ------------------------------------------------------------
  myKitchen() {
    return request<ApiKitchen>('/api/maker/kitchen');
  },
  makerDishes() {
    return request<ApiDish[]>('/api/maker/dishes');
  },
  createKitchen(input: { name: string; about?: string; location?: string }) {
    return request<ApiKitchen>('/api/maker/kitchens', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },
  createDish(input: {
    name: string;
    description?: string;
    priceCents: number;
    category: string;
    tags?: string;
    portion?: string;
    quantityTotal: number;
    pickupStart?: string;
    pickupEnd?: string;
  }) {
    return request<ApiDish>('/api/maker/dishes', { method: 'POST', body: JSON.stringify(input) });
  },
  updateDish(id: string, input: Partial<{ isActive: boolean; quantityLeft: number; priceCents: number; name: string; description: string }>) {
    return request<ApiDish>(`/api/maker/dishes/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    });
  },
  makerOrders(status?: ApiOrderStatus) {
    const q = status ? `?status=${status}` : '';
    return request<ApiOrder[]>(`/api/maker/orders${q}`);
  },
  acceptOrder(id: string) {
    return request<ApiOrder>(`/api/maker/orders/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify({ action: 'accept' }),
    });
  },
  rejectOrder(id: string) {
    return request<ApiOrder>(`/api/maker/orders/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify({ action: 'reject' }),
    });
  },
  makerEarnings() {
    return request<ApiEarnings>('/api/maker/earnings');
  },
  makerDashboard() {
    return request<ApiDashboard>('/api/maker/dashboard');
  },
};
