// App state backed by the real Foodie backend API.
// Falls back to the bundled seed data when the API is unreachable, so the
// app still demos offline.
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  ApiDish,
  ApiEarnings,
  ApiDashboard,
  ApiError,
  ApiKitchen,
  ApiOrder,
  ApiOrderStatus,
  ApiUser,
  api,
  getToken,
} from './api';
import {
  Cook,
  CustomerOrder,
  CustomerOrderStatus,
  FoodItem,
  MakerOrder,
  MakerOrderStatus,
  cooks as seedCooks,
  foods as seedFoods,
} from './data';

export type Role = 'customer' | 'maker' | null;

export interface CartLine {
  food: FoodItem;
  qty: number;
}

export interface NewFoodInput {
  name: string;
  description: string;
  category: string;
  price: number;
  portionsTotal: number;
  pickupStart: string;
  pickupEnd: string;
  tags: string;
  portion: string;
}

export interface ReviewInput {
  overall: number;
  quality: number;
  packaging: number;
  accuracy: number;
  comment?: string;
}

// ------------------------------------------------------------ mapping ---

const formatFollowers = (n: number): string =>
  n >= 1000 ? `${(n / 1000).toFixed(1)}k` : `${n}`;

const splitTags = (tags: string): string[] =>
  tags
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);

export function mapDish(d: ApiDish): FoodItem {
  return {
    id: d.id,
    cookId: d.kitchenId,
    name: d.name,
    price: d.priceCents / 100,
    image: d.imageUrl ?? `https://picsum.photos/seed/${encodeURIComponent(d.id)}/800/600`,
    category: d.category,
    description: d.description,
    tags: splitTags(d.tags),
    portion: d.portion,
    portionsLeft: d.quantityLeft,
    portionsTotal: d.quantityTotal,
    pickupStart: d.pickupStart,
    pickupEnd: d.pickupEnd,
    distanceMi: 1.0,
    active: d.isActive,
  };
}

export function mapKitchen(k: ApiKitchen): Cook {
  return {
    id: k.id,
    name: k.name,
    avatar: k.avatarUrl ?? `https://picsum.photos/seed/${encodeURIComponent(k.id)}-face/200/200`,
    banner: k.bannerUrl ?? `https://picsum.photos/seed/${encodeURIComponent(k.id)}-banner/1200/500`,
    rating: k.rating,
    reviewCount: k.reviewCount,
    distanceMi: 1.0,
    about: k.about,
    verified: k.verified,
    followers: formatFollowers(k.followerCount),
  };
}

const ORDER_STATUS: Record<ApiOrderStatus, CustomerOrderStatus> = {
  NEW: 'Preparing',
  ACTIVE: 'On the way',
  COMPLETED: 'Delivered',
  CANCELLED: 'Cancelled',
};

export function mapCustomerOrder(o: ApiOrder): CustomerOrder {
  return {
    id: o.id,
    items: o.items.map((i) => ({
      foodId: i.dishId,
      name: i.nameSnapshot,
      qty: i.qty,
      price: i.priceCentsSnapshot / 100,
    })),
    total: o.totalCents / 100,
    status: ORDER_STATUS[o.status],
    date: new Date(o.createdAt).toLocaleDateString(),
    pickupWindow: o.pickupSlot,
    cookName: o.kitchen?.name ?? '',
    cookId: o.kitchenId,
  };
}

const MAKER_STATUS: Record<ApiOrderStatus, MakerOrderStatus> = {
  NEW: 'New',
  ACTIVE: 'Active',
  COMPLETED: 'Completed',
  CANCELLED: 'Completed',
};

export function mapMakerOrder(o: ApiOrder): MakerOrder {
  return {
    id: o.id,
    customer: o.customer?.name ?? 'Customer',
    items: o.items.map((i) => ({ name: i.nameSnapshot, qty: i.qty })),
    total: o.totalCents / 100,
    pickupTime: o.pickupSlot || new Date(o.createdAt).toLocaleTimeString(),
    status: MAKER_STATUS[o.status],
  };
}

// ------------------------------------------------------------ context ---

interface AppContextValue {
  // auth
  user: ApiUser | null;
  authReady: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  apiOnline: boolean;
  // onboarding
  role: Role;
  setRole: (r: Role) => void;
  userName: string;
  location: string;
  setLocation: (s: string) => void;
  // catalog
  foods: FoodItem[];
  cooks: Cook[];
  catalogLoading: boolean;
  refreshCatalog: () => Promise<void>;
  foodById: (id: string) => FoodItem | undefined;
  cookById: (id: string) => Cook;
  foodsByCook: (cookId: string) => FoodItem[];
  // cart & ordering
  cart: CartLine[];
  addToCart: (foodId: string, qty?: number) => void;
  setQty: (foodId: string, qty: number) => void;
  cartCount: number;
  cartSubtotal: number;
  clearCart: () => void;
  orders: CustomerOrder[];
  ordersLoading: boolean;
  refreshOrders: () => Promise<void>;
  lastOrder: CustomerOrder | null;
  placeOrder: (paymentLabel: string) => Promise<CustomerOrder>;
  submitReview: (orderId: string, input: ReviewInput) => Promise<void>;
  followed: string[];
  toggleFollow: (cookId: string) => Promise<void>;
  // maker
  myKitchen: ApiKitchen | null;
  createMyKitchen: (name: string, about: string, location: string) => Promise<void>;
  makerMenu: FoodItem[];
  addMakerFood: (input: NewFoodInput) => Promise<void>;
  toggleMakerFood: (id: string) => Promise<void>;
  makerOrders: MakerOrder[];
  refreshMakerOrders: () => Promise<void>;
  acceptMakerOrder: (id: string) => Promise<void>;
  rejectMakerOrder: (id: string) => Promise<void>;
  earnings: ApiEarnings | null;
  dashboard: ApiDashboard | null;
  refreshMakerStats: () => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

const money = (n: number) => Math.round(n * 100) / 100;

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<ApiUser | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [apiOnline, setApiOnline] = useState(true);
  const [role, setRole] = useState<Role>(null);
  const [location, setLocation] = useState('San Francisco, CA');

  const [foods, setFoods] = useState<FoodItem[]>(seedFoods);
  const [cooks, setCooks] = useState<Cook[]>(seedCooks);
  const [catalogLoading, setCatalogLoading] = useState(true);

  const [cart, setCart] = useState<CartLine[]>([]);
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [lastOrder, setLastOrder] = useState<CustomerOrder | null>(null);
  const [followed, setFollowed] = useState<string[]>([]);

  const [myKitchen, setMyKitchen] = useState<ApiKitchen | null>(null);
  const [makerMenu, setMakerMenu] = useState<FoodItem[]>([]);
  const [makerOrders, setMakerOrders] = useState<MakerOrder[]>([]);
  const [earnings, setEarnings] = useState<ApiEarnings | null>(null);
  const [dashboard, setDashboard] = useState<ApiDashboard | null>(null);

  const userRef = useRef<ApiUser | null>(null);
  userRef.current = user;

  const markOnline = useCallback((ok: boolean) => setApiOnline(ok), []);

  // ---------------------------------------------------------- catalog ---
  const refreshCatalog = useCallback(async () => {
    setCatalogLoading(true);
    try {
      const [dishes, kitchens] = await Promise.all([api.listDishes({ limit: 100 }), api.listKitchens()]);
      setFoods(dishes.data.map(mapDish));
      setCooks(kitchens.data.map(mapKitchen));
      markOnline(true);
    } catch (e) {
      if (!(e instanceof ApiError)) markOnline(false); // network down → keep seed data
      setFoods((prev) => (prev.length ? prev : seedFoods));
      setCooks((prev) => (prev.length ? prev : seedCooks));
    } finally {
      setCatalogLoading(false);
    }
  }, [markOnline]);

  const foodById = useCallback((id: string) => foods.find((f) => f.id === id), [foods]);
  const cookById = useCallback(
    (id: string) => cooks.find((c) => c.id === id) ?? cooks[0] ?? seedCooks[0],
    [cooks],
  );
  const foodsByCook = useCallback((cookId: string) => foods.filter((f) => f.cookId === cookId), [foods]);

  // ------------------------------------------------------------- auth ---
  const loadCustomerData = useCallback(async () => {
    setOrdersLoading(true);
    try {
      const data = await api.myOrders();
      setOrders(data.map(mapCustomerOrder));
    } catch {
      // keep whatever we have
    } finally {
      setOrdersLoading(false);
    }
  }, []);

  const loadMakerData = useCallback(async () => {
    try {
      const kitchen = await api.myKitchen();
      setMyKitchen(kitchen);
      const [dishes, orders] = await Promise.all([api.makerDishes(), api.makerOrders()]);
      setMakerMenu(dishes.map(mapDish));
      setMakerOrders(orders.map(mapMakerOrder));
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) {
        setMyKitchen(null); // maker hasn't created a kitchen yet
      }
    }
  }, []);

  const refreshMakerStats = useCallback(async () => {
    try {
      const [e, d] = await Promise.all([api.makerEarnings(), api.makerDashboard()]);
      setEarnings(e);
      setDashboard(d);
    } catch {
      // stats are best-effort
    }
  }, []);

  const afterAuth = useCallback(
    async (u: ApiUser) => {
      setUser(u);
      setRole(u.role === 'MAKER' ? 'maker' : 'customer');
      if (u.role === 'MAKER') {
        await loadMakerData();
      } else {
        await loadCustomerData();
      }
    },
    [loadCustomerData, loadMakerData],
  );

  useEffect(() => {
    (async () => {
      await refreshCatalog();
      try {
        const token = await getToken();
        if (token) {
          const { user: u } = await api.me();
          await afterAuth(u);
        }
      } catch {
        await api.logout();
      } finally {
        setAuthReady(true);
      }
    })();
  }, [refreshCatalog, afterAuth]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      const { user: u } = await api.login(email.trim(), password);
      markOnline(true);
      await afterAuth(u);
      await refreshCatalog();
    },
    [afterAuth, refreshCatalog, markOnline],
  );

  const signUp = useCallback(
    async (name: string, email: string, password: string) => {
      const apiRole = role === 'maker' ? 'MAKER' : 'CUSTOMER';
      const { user: u } = await api.signup({ name: name.trim(), email: email.trim(), password, role: apiRole });
      markOnline(true);
      await afterAuth(u);
      await refreshCatalog();
    },
    [role, afterAuth, refreshCatalog, markOnline],
  );

  const signOut = useCallback(async () => {
    await api.logout();
    setUser(null);
    setRole(null);
    setOrders([]);
    setLastOrder(null);
    setMyKitchen(null);
    setMakerMenu([]);
    setMakerOrders([]);
    setEarnings(null);
    setDashboard(null);
    setFollowed([]);
    setCart([]);
  }, []);

  // --------------------------------------------------------- cart/order ---
  const addToCart = useCallback(
    (foodId: string, qty: number = 1) => {
      const food = foods.find((f) => f.id === foodId);
      if (!food) return;
      setCart((prev) => {
        const existing = prev.find((l) => l.food.id === foodId);
        if (existing) {
          return prev.map((l) => (l.food.id === foodId ? { ...l, qty: l.qty + qty } : l));
        }
        return [...prev, { food, qty }];
      });
    },
    [foods],
  );

  const setQty = useCallback((foodId: string, qty: number) => {
    setCart((prev) =>
      qty <= 0
        ? prev.filter((l) => l.food.id !== foodId)
        : prev.map((l) => (l.food.id === foodId ? { ...l, qty } : l)),
    );
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const cartCount = useMemo(() => cart.reduce((s, l) => s + l.qty, 0), [cart]);
  const cartSubtotal = useMemo(() => money(cart.reduce((s, l) => s + l.qty * l.food.price, 0)), [cart]);

  const refreshOrders = useCallback(async () => {
    await loadCustomerData();
  }, [loadCustomerData]);

  const placeOrder = useCallback(
    async (paymentLabel: string): Promise<CustomerOrder> => {
      if (cart.length === 0) throw new Error('Your cart is empty');
      const kitchenIds = [...new Set(cart.map((l) => l.food.cookId))];
      if (kitchenIds.length > 1) {
        throw new Error('One order per kitchen — please check out each kitchen separately');
      }
      const first = cart[0];
      const { order } = await api.createOrder({
        items: cart.map((l) => ({ dishId: l.food.id, qty: l.qty })),
        paymentMethod: paymentLabel,
        pickupSlot: `${first.food.pickupStart} - ${first.food.pickupEnd}`,
      });
      const mapped = mapCustomerOrder(order);
      setOrders((prev) => [mapped, ...prev]);
      setLastOrder(mapped);
      clearCart();
      return mapped;
    },
    [cart, clearCart],
  );

  const submitReview = useCallback(
    async (orderId: string, input: ReviewInput) => {
      await api.reviewOrder(orderId, input);
      await refreshCatalog(); // refresh kitchen ratings
    },
    [refreshCatalog],
  );

  const toggleFollow = useCallback(async (cookId: string) => {
    const isFollowing = followed.includes(cookId);
    setFollowed((prev) => (isFollowing ? prev.filter((c) => c !== cookId) : [...prev, cookId]));
    try {
      if (isFollowing) await api.unfollowKitchen(cookId);
      else await api.followKitchen(cookId);
    } catch {
      // revert on failure
      setFollowed((prev) => (isFollowing ? [...prev, cookId] : prev.filter((c) => c !== cookId)));
    }
  }, [followed]);

  // -------------------------------------------------------------- maker ---
  const createMyKitchen = useCallback(
    async (name: string, about: string, loc: string) => {
      const kitchen = await api.createKitchen({ name, about, location: loc });
      setMyKitchen(kitchen);
      setCooks((prev) => [mapKitchen(kitchen), ...prev.filter((c) => c.id !== kitchen.id)]);
    },
    [],
  );

  const addMakerFood = useCallback(
    async (input: NewFoodInput) => {
      const dish = await api.createDish({
        name: input.name || 'Untitled Dish',
        description: input.description,
        priceCents: Math.round((input.price || 0) * 100),
        category: input.category || 'indian',
        tags: input.tags,
        portion: input.portion || '1 portion',
        quantityTotal: input.portionsTotal || 0,
        pickupStart: input.pickupStart || '5:00 PM',
        pickupEnd: input.pickupEnd || '7:00 PM',
      });
      const item = mapDish(dish);
      setMakerMenu((prev) => [item, ...prev]);
      setFoods((prev) => [item, ...prev.filter((f) => f.id !== item.id)]);
    },
    [],
  );

  const toggleMakerFood = useCallback(async (id: string) => {
    const current = makerMenu.find((f) => f.id === id);
    const updated = await api.updateDish(id, { isActive: current?.active === false });
    const item = mapDish(updated);
    setMakerMenu((prev) => prev.map((f) => (f.id === id ? item : f)));
    setFoods((prev) => prev.map((f) => (f.id === id ? item : f)));
  }, [makerMenu]);

  const refreshMakerOrders = useCallback(async () => {
    try {
      const orders = await api.makerOrders();
      setMakerOrders(orders.map(mapMakerOrder));
    } catch {
      // keep current
    }
  }, []);

  const acceptMakerOrder = useCallback(
    async (id: string) => {
      await api.acceptOrder(id);
      await refreshMakerOrders();
    },
    [refreshMakerOrders],
  );

  const rejectMakerOrder = useCallback(
    async (id: string) => {
      await api.rejectOrder(id);
      await refreshMakerOrders();
    },
    [refreshMakerOrders],
  );

  const userName = user?.name ?? 'Guest';

  const value: AppContextValue = {
    user,
    authReady,
    signIn,
    signUp,
    signOut,
    apiOnline,
    role,
    setRole,
    userName,
    location,
    setLocation,
    foods,
    cooks,
    catalogLoading,
    refreshCatalog,
    foodById,
    cookById,
    foodsByCook,
    cart,
    addToCart,
    setQty,
    cartCount,
    cartSubtotal,
    clearCart,
    orders,
    ordersLoading,
    refreshOrders,
    lastOrder,
    placeOrder,
    submitReview,
    followed,
    toggleFollow,
    myKitchen,
    createMyKitchen,
    makerMenu,
    addMakerFood,
    toggleMakerFood,
    makerOrders,
    refreshMakerOrders,
    acceptMakerOrder,
    rejectMakerOrder,
    earnings,
    dashboard,
    refreshMakerStats,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
