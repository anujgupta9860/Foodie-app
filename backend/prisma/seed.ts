// Seed the dev database with demo data matching the Expo app's mock data.
// Run: npm run seed   (requires DATABASE_URL to point at a migrated database)
import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { prisma } from '../src/prisma';

const img = (seed: string, w = 800, h = 600) =>
  `https://picsum.photos/seed/${seed}/${w}/${h}`;

async function main() {
  const passwordHash = await bcrypt.hash('password123', 10);

  // --- Users ---
  const users = [
    { email: 'customer@foodie.demo', name: 'Sarah Johnson', role: 'CUSTOMER' as const },
    { email: 'maker@foodie.demo', name: 'Priya Sharma', role: 'MAKER' as const },
    { email: 'maria.maker@foodie.demo', name: 'Maria Gonzalez', role: 'MAKER' as const },
    { email: 'tony.maker@foodie.demo', name: 'Tony Rossi', role: 'MAKER' as const },
    { email: 'lin.maker@foodie.demo', name: 'Lin Chen', role: 'MAKER' as const },
    { email: 'admin@foodie.demo', name: 'Admin', role: 'ADMIN' as const },
  ];
  const userByEmail: Record<string, { id: string }> = {};
  for (const u of users) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: { name: u.name, role: u.role, passwordHash },
      create: { ...u, passwordHash },
      select: { id: true },
    });
    userByEmail[u.email] = user;
  }

  // --- Kitchens (ids match the app's cook ids) ---
  const kitchens = [
    {
      id: 'priya',
      ownerEmail: 'maker@foodie.demo',
      name: "Priya's Kitchen",
      about: 'I love cooking traditional Indian food for my local community',
      location: 'San Francisco, CA',
      avatarUrl: img('priya-face', 200, 200),
      bannerUrl: img('priya-banner', 1200, 500),
      rating: 4.8,
      reviewCount: 63,
      followerCount: 1200,
    },
    {
      id: 'maria',
      ownerEmail: 'maria.maker@foodie.demo',
      name: "Maria's Cocina",
      about: 'Authentic Mexican recipes passed down three generations',
      location: 'San Francisco, CA',
      avatarUrl: img('maria-face', 200, 200),
      bannerUrl: img('maria-banner', 1200, 500),
      rating: 4.9,
      reviewCount: 41,
      followerCount: 860,
    },
    {
      id: 'tony',
      ownerEmail: 'tony.maker@foodie.demo',
      name: "Tony's Trattoria",
      about: 'Wood-fired Italian classics from my family kitchen',
      location: 'San Francisco, CA',
      avatarUrl: img('tony-face', 200, 200),
      bannerUrl: img('tony-banner', 1200, 500),
      rating: 4.7,
      reviewCount: 88,
      followerCount: 2100,
    },
    {
      id: 'lin',
      ownerEmail: 'lin.maker@foodie.demo',
      name: "Lin's Kitchen",
      about: 'Fresh Asian comfort food, made every morning',
      location: 'San Francisco, CA',
      avatarUrl: img('lin-face', 200, 200),
      bannerUrl: img('lin-banner', 1200, 500),
      rating: 4.9,
      reviewCount: 52,
      followerCount: 940,
    },
  ];
  for (const k of kitchens) {
    const { ownerEmail, ...data } = k;
    await prisma.kitchen.upsert({
      where: { id: k.id },
      update: { ...data, ownerId: userByEmail[ownerEmail].id, verified: true },
      create: { ...data, ownerId: userByEmail[ownerEmail].id, verified: true },
    });
  }

  // --- Dishes (ids match the app's food ids; prices in cents) ---
  // quantityLeft already reflects the two seeded orders below.
  const dishes = [
    { id: 'chicken-biryani', kitchenId: 'priya', name: 'Chicken Biryani', priceCents: 1400, category: 'indian', description: 'Fragrant basmati rice with chicken, spices and homemade masala.', tags: 'Non-veg, Medium spice', portion: '1 portion = 350g', quantityTotal: 10, quantityLeft: 5, pickupStart: '5:00 PM', pickupEnd: '7:00 PM', imageUrl: img('biryani-dish') },
    { id: 'gulab-jamun', kitchenId: 'priya', name: 'Gulab Jamun', priceCents: 600, category: 'indian', description: 'Soft milk dumplings soaked in rose-cardamom syrup.', tags: 'Veg, Sweet', portion: '4 pieces = 200g', quantityTotal: 24, quantityLeft: 9, pickupStart: '5:00 PM', pickupEnd: '7:00 PM', imageUrl: img('gulab-jamun') },
    { id: 'garlic-naan', kitchenId: 'priya', name: 'Garlic Naan', priceCents: 400, category: 'indian', description: 'Fluffy tandoor-style flatbread brushed with garlic butter.', tags: 'Veg', portion: '2 pieces', quantityTotal: 20, quantityLeft: 12, pickupStart: '5:00 PM', pickupEnd: '7:00 PM', imageUrl: img('garlic-naan') },
    { id: 'paneer-butter-masala', kitchenId: 'priya', name: 'Paneer Butter Masala', priceCents: 1600, category: 'indian', description: 'Cottage cheese simmered in a creamy tomato gravy.', tags: 'Veg, Mild', portion: '1 portion = 350g', quantityTotal: 12, quantityLeft: 7, pickupStart: '5:00 PM', pickupEnd: '7:00 PM', imageUrl: img('paneer-masala') },
    { id: 'tacos-al-pastor', kitchenId: 'maria', name: 'Tacos al Pastor', priceCents: 1200, category: 'mexican', description: 'Marinated pork, pineapple, onion and cilantro on corn tortillas.', tags: 'Non-veg, Spicy', portion: '3 tacos', quantityTotal: 15, quantityLeft: 9, pickupStart: '6:00 PM', pickupEnd: '8:00 PM', imageUrl: img('tacos-pastor') },
    { id: 'churros', kitchenId: 'maria', name: 'Churros', priceCents: 500, category: 'mexican', description: 'Crispy cinnamon-sugar churros with a chocolate dip.', tags: 'Veg, Sweet', portion: '5 pieces', quantityTotal: 20, quantityLeft: 14, pickupStart: '6:00 PM', pickupEnd: '8:00 PM', imageUrl: img('churros-dessert') },
    { id: 'margherita-pizza', kitchenId: 'tony', name: 'Margherita Pizza', priceCents: 1500, category: 'italian', description: 'San Marzano tomato, fior di latte and basil on a wood-fired crust.', tags: 'Veg', portion: '12 inch', quantityTotal: 8, quantityLeft: 5, pickupStart: '6:30 PM', pickupEnd: '8:30 PM', imageUrl: img('margherita-pizza') },
    { id: 'nonnas-lasagna', kitchenId: 'tony', name: "Nonna's Lasagna", priceCents: 1700, category: 'italian', description: 'Slow-cooked ragù layered with béchamel and parmesan.', tags: 'Non-veg', portion: '1 portion = 400g', quantityTotal: 6, quantityLeft: 4, pickupStart: '6:30 PM', pickupEnd: '8:30 PM', imageUrl: img('lasagna-dish') },
    { id: 'kung-pao-chicken', kitchenId: 'lin', name: 'Kung Pao Chicken', priceCents: 1300, category: 'asian', description: 'Wok-tossed chicken, peanuts and dried chilies in a savory glaze.', tags: 'Non-veg, Spicy', portion: '1 portion = 350g', quantityTotal: 10, quantityLeft: 7, pickupStart: '5:30 PM', pickupEnd: '7:30 PM', imageUrl: img('kung-pao') },
    { id: 'veg-fried-rice', kitchenId: 'lin', name: 'Vegetable Fried Rice', priceCents: 1000, category: 'asian', description: 'Smoky wok-hei fried rice with seasonal vegetables.', tags: 'Veg', portion: '1 portion = 350g', quantityTotal: 14, quantityLeft: 11, pickupStart: '5:30 PM', pickupEnd: '7:30 PM', imageUrl: img('fried-rice') },
  ];
  for (const d of dishes) {
    await prisma.dish.upsert({
      where: { id: d.id },
      update: { ...d },
      create: { ...d },
    });
  }

  // --- Sample orders (delete + recreate so the seed is re-runnable) ---
  const customerId = userByEmail['customer@foodie.demo'].id;
  await prisma.order.deleteMany({ where: { id: { in: ['FD123456', 'FD87654'] } } });

  await prisma.order.create({
    data: {
      id: 'FD123456',
      customerId,
      kitchenId: 'priya',
      status: 'ACTIVE',
      subtotalCents: 2000,
      serviceFeeCents: 0,
      totalCents: 2000,
      paymentMethod: 'Apple Pay',
      pickupSlot: '5:00 PM - 7:00 PM',
      paymentIntentId: 'pi_mock_seed_1',
      items: {
        create: [
          { dishId: 'chicken-biryani', nameSnapshot: 'Chicken Biryani', priceCentsSnapshot: 1400, qty: 1 },
          { dishId: 'gulab-jamun', nameSnapshot: 'Gulab Jamun', priceCentsSnapshot: 600, qty: 1 },
        ],
      },
    },
  });

  await prisma.order.create({
    data: {
      id: 'FD87654',
      customerId,
      kitchenId: 'priya',
      status: 'COMPLETED',
      subtotalCents: 1600,
      serviceFeeCents: 0,
      totalCents: 1600,
      paymentMethod: 'Apple Pay',
      pickupSlot: '6:00 PM - 8:00 PM',
      paymentIntentId: 'pi_mock_seed_2',
      items: {
        create: [
          { dishId: 'paneer-butter-masala', nameSnapshot: 'Paneer Butter Masala', priceCentsSnapshot: 1600, qty: 1 },
        ],
      },
    },
  });

  // --- One review on the completed order ---
  await prisma.review.create({
    data: {
      orderId: 'FD87654',
      customerId,
      kitchenId: 'priya',
      overall: 5,
      quality: 5,
      packaging: 4,
      accuracy: 5,
      comment: 'Amazing flavors, tasted just like home!',
    },
  });

  // --- A sample payout for Priya's Kitchen ---
  await prisma.payout.upsert({
    where: { id: 'payout-seed-1' },
    update: {},
    create: {
      id: 'payout-seed-1',
      kitchenId: 'priya',
      period: '2026-09',
      grossCents: 34250,
      commissionCents: 3425,
      tipsCents: 110,
      netCents: 30935,
      status: 'PAID',
    },
  });

  console.log('Seed complete: 6 users, 4 kitchens, 10 dishes, 2 orders, 1 review, 1 payout.');
  console.log('Logins (password for all): customer@foodie.demo / maker@foodie.demo / admin@foodie.demo');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
