const img = (seed: string, w = 800, h = 600) =>
  `https://picsum.photos/seed/${seed}/${w}/${h}`;

export interface Category {
  id: string;
  label: string;
  icon: string;
}

export interface Cook {
  id: string;
  name: string;
  avatar: string;
  banner: string;
  rating: number;
  reviewCount: number;
  distanceMi: number;
  about: string;
  verified: boolean;
  followers: string;
}

export interface FoodItem {
  id: string;
  cookId: string;
  name: string;
  price: number;
  image: string;
  category: string;
  description: string;
  tags: string[];
  portion: string;
  portionsLeft: number;
  portionsTotal: number;
  pickupStart: string;
  pickupEnd: string;
  distanceMi: number;
  active?: boolean;
}

export interface OrderItem {
  foodId: string;
  name: string;
  qty: number;
  price: number;
}

export type CustomerOrderStatus = 'Preparing' | 'On the way' | 'Delivered' | 'Cancelled';

export interface CustomerOrder {
  id: string;
  items: OrderItem[];
  total: number;
  status: CustomerOrderStatus;
  date: string;
  pickupWindow: string;
  cookName: string;
  cookId: string;
}

export type MakerOrderStatus = 'New' | 'Active' | 'Completed';

export interface MakerOrder {
  id: string;
  customer: string;
  items: { name: string; qty: number }[];
  total: number;
  pickupTime: string;
  status: MakerOrderStatus;
}

export const categories: Category[] = [
  { id: 'indian', label: 'Indian', icon: '🍛' },
  { id: 'mexican', label: 'Mexican', icon: '🌮' },
  { id: 'italian', label: 'Italian', icon: '🍝' },
  { id: 'asian', label: 'Asian', icon: '🍜' },
  { id: 'bakery', label: 'Bakery', icon: '🥐' },
  { id: 'healthy', label: 'Healthy', icon: '🥗' },
  { id: 'american', label: 'American', icon: '🍔' },
  { id: 'more', label: 'More', icon: '⋯' },
];

export const cooks: Cook[] = [
  {
    id: 'priya',
    name: "Priya's Kitchen",
    avatar: img('priya-face', 200, 200),
    banner: img('priya-banner', 1200, 500),
    rating: 4.8,
    reviewCount: 63,
    distanceMi: 1.4,
    about: 'I love cooking traditional Indian food for my local community',
    verified: true,
    followers: '1.2k',
  },
  {
    id: 'maria',
    name: "Maria's Cocina",
    avatar: img('maria-face', 200, 200),
    banner: img('maria-banner', 1200, 500),
    rating: 4.9,
    reviewCount: 41,
    distanceMi: 2.1,
    about: 'Authentic Mexican recipes passed down three generations',
    verified: true,
    followers: '860',
  },
  {
    id: 'tony',
    name: "Tony's Trattoria",
    avatar: img('tony-face', 200, 200),
    banner: img('tony-banner', 1200, 500),
    rating: 4.7,
    reviewCount: 88,
    distanceMi: 3.2,
    about: 'Wood-fired Italian classics from my family kitchen',
    verified: true,
    followers: '2.1k',
  },
  {
    id: 'lin',
    name: "Lin's Kitchen",
    avatar: img('lin-face', 200, 200),
    banner: img('lin-banner', 1200, 500),
    rating: 4.9,
    reviewCount: 52,
    distanceMi: 0.8,
    about: 'Fresh Asian comfort food, made every morning',
    verified: true,
    followers: '940',
  },
];

export const foods: FoodItem[] = [
  {
    id: 'chicken-biryani',
    cookId: 'priya',
    name: 'Chicken Biryani',
    price: 14,
    image: img('biryani-dish'),
    category: 'indian',
    description: 'Fragrant basmati rice with chicken, spices and homemade masala.',
    tags: ['Non-veg', 'Medium spice'],
    portion: '1 portion = 350g',
    portionsLeft: 6,
    portionsTotal: 10,
    pickupStart: '5:00 PM',
    pickupEnd: '7:00 PM',
    distanceMi: 1.4,
    active: true,
  },
  {
    id: 'gulab-jamun',
    cookId: 'priya',
    name: 'Gulab Jamun',
    price: 6,
    image: img('gulab-jamun'),
    category: 'indian',
    description: 'Soft milk dumplings soaked in rose-cardamom syrup.',
    tags: ['Veg', 'Sweet'],
    portion: '4 pieces = 200g',
    portionsLeft: 10,
    portionsTotal: 24,
    pickupStart: '5:00 PM',
    pickupEnd: '7:00 PM',
    distanceMi: 1.4,
    active: true,
  },
  {
    id: 'garlic-naan',
    cookId: 'priya',
    name: 'Garlic Naan',
    price: 4,
    image: img('garlic-naan'),
    category: 'indian',
    description: 'Fluffy tandoor-style flatbread brushed with garlic butter.',
    tags: ['Veg'],
    portion: '2 pieces',
    portionsLeft: 12,
    portionsTotal: 20,
    pickupStart: '5:00 PM',
    pickupEnd: '7:00 PM',
    distanceMi: 1.4,
    active: true,
  },
  {
    id: 'paneer-butter-masala',
    cookId: 'priya',
    name: 'Paneer Butter Masala',
    price: 16,
    image: img('paneer-masala'),
    category: 'indian',
    description: 'Cottage cheese simmered in a creamy tomato gravy.',
    tags: ['Veg', 'Mild'],
    portion: '1 portion = 350g',
    portionsLeft: 8,
    portionsTotal: 12,
    pickupStart: '5:00 PM',
    pickupEnd: '7:00 PM',
    distanceMi: 1.4,
    active: true,
  },
  {
    id: 'tacos-al-pastor',
    cookId: 'maria',
    name: 'Tacos al Pastor',
    price: 12,
    image: img('tacos-pastor'),
    category: 'mexican',
    description: 'Marinated pork, pineapple, onion and cilantro on corn tortillas.',
    tags: ['Non-veg', 'Spicy'],
    portion: '3 tacos',
    portionsLeft: 9,
    portionsTotal: 15,
    pickupStart: '6:00 PM',
    pickupEnd: '8:00 PM',
    distanceMi: 2.1,
    active: true,
  },
  {
    id: 'churros',
    cookId: 'maria',
    name: 'Churros',
    price: 5,
    image: img('churros-dessert'),
    category: 'mexican',
    description: 'Crispy cinnamon-sugar churros with a chocolate dip.',
    tags: ['Veg', 'Sweet'],
    portion: '5 pieces',
    portionsLeft: 14,
    portionsTotal: 20,
    pickupStart: '6:00 PM',
    pickupEnd: '8:00 PM',
    distanceMi: 2.1,
    active: true,
  },
  {
    id: 'margherita-pizza',
    cookId: 'tony',
    name: 'Margherita Pizza',
    price: 15,
    image: img('margherita-pizza'),
    category: 'italian',
    description: 'San Marzano tomato, fior di latte and basil on a wood-fired crust.',
    tags: ['Veg'],
    portion: '12 inch',
    portionsLeft: 5,
    portionsTotal: 8,
    pickupStart: '6:30 PM',
    pickupEnd: '8:30 PM',
    distanceMi: 3.2,
    active: true,
  },
  {
    id: 'nonnas-lasagna',
    cookId: 'tony',
    name: "Nonna's Lasagna",
    price: 17,
    image: img('lasagna-dish'),
    category: 'italian',
    description: 'Slow-cooked ragu layered with bechamel and parmesan.',
    tags: ['Non-veg'],
    portion: '1 portion = 400g',
    portionsLeft: 4,
    portionsTotal: 6,
    pickupStart: '6:30 PM',
    pickupEnd: '8:30 PM',
    distanceMi: 3.2,
    active: true,
  },
  {
    id: 'kung-pao-chicken',
    cookId: 'lin',
    name: 'Kung Pao Chicken',
    price: 13,
    image: img('kung-pao'),
    category: 'asian',
    description: 'Wok-tossed chicken, peanuts and dried chilies in a savory glaze.',
    tags: ['Non-veg', 'Spicy'],
    portion: '1 portion = 350g',
    portionsLeft: 7,
    portionsTotal: 10,
    pickupStart: '5:30 PM',
    pickupEnd: '7:30 PM',
    distanceMi: 0.8,
    active: true,
  },
  {
    id: 'veg-fried-rice',
    cookId: 'lin',
    name: 'Vegetable Fried Rice',
    price: 10,
    image: img('fried-rice'),
    category: 'asian',
    description: 'Smoky wok-hei fried rice with seasonal vegetables.',
    tags: ['Veg'],
    portion: '1 portion = 350g',
    portionsLeft: 11,
    portionsTotal: 14,
    pickupStart: '5:30 PM',
    pickupEnd: '7:30 PM',
    distanceMi: 0.8,
    active: true,
  },
];

export const cookById = (id: string): Cook => cooks.find((c) => c.id === id) ?? cooks[0];

export const foodById = (id: string): FoodItem | undefined => foods.find((f) => f.id === id);

export const foodsByCook = (cookId: string): FoodItem[] => foods.filter((f) => f.cookId === cookId);

export const initialCustomerOrders: CustomerOrder[] = [
  {
    id: 'FD123456',
    items: [
      { foodId: 'chicken-biryani', name: 'Chicken Biryani', qty: 1, price: 14 },
      { foodId: 'gulab-jamun', name: 'Gulab Jamun', qty: 1, price: 6 },
    ],
    total: 20,
    status: 'Preparing',
    date: 'Today',
    pickupWindow: '5:00 PM - 7:00 PM',
    cookName: "Priya's Kitchen",
    cookId: 'priya',
  },
  {
    id: 'FD87654',
    items: [{ foodId: 'paneer-butter-masala', name: 'Paneer Butter Masala', qty: 1, price: 16 }],
    total: 16,
    status: 'Delivered',
    date: 'Jun 12, 2026',
    pickupWindow: '6:00 PM - 8:00 PM',
    cookName: "Priya's Kitchen",
    cookId: 'priya',
  },
];

export const initialMakerOrders: MakerOrder[] = [
  {
    id: 'FD123456',
    customer: 'Sarah J.',
    items: [{ name: 'Chicken Biryani', qty: 2 }],
    total: 28,
    pickupTime: '5:30 PM',
    status: 'New',
  },
  {
    id: 'FD123455',
    customer: 'Mike L.',
    items: [{ name: 'Paneer Butter Masala', qty: 1 }],
    total: 16,
    pickupTime: '6:00 PM',
    status: 'New',
  },
  {
    id: 'FD123454',
    customer: 'Emily D.',
    items: [{ name: 'Garlic Naan', qty: 4 }],
    total: 16,
    pickupTime: '5:45 PM',
    status: 'Active',
  },
  {
    id: 'FD123450',
    customer: 'James W.',
    items: [
      { name: 'Chicken Biryani', qty: 1 },
      { name: 'Gulab Jamun', qty: 2 },
    ],
    total: 26,
    pickupTime: 'Yesterday',
    status: 'Completed',
  },
];

export const makerEarnings = {
  totalThisMonth: 342.5,
  ordersTotal: 358.0,
  commission: 35.8,
  commissionRate: 10,
  tips: 1.1,
  weekly: [22, 35, 28, 41, 30, 52, 44, 38, 47, 33, 55, 49],
};
