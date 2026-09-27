// Type-safe enums for fields stored as plain strings in the DB.
// (SQLite has no native enum support; switch the schema to `postgresql` and
// these can become native Prisma enums without changing any route code.)
export const Role = {
  CUSTOMER: 'CUSTOMER',
  MAKER: 'MAKER',
  ADMIN: 'ADMIN',
} as const;
export type Role = (typeof Role)[keyof typeof Role];

export const OrderStatus = {
  NEW: 'NEW',
  ACTIVE: 'ACTIVE',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const;
export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];

export const PayoutStatus = {
  PENDING: 'PENDING',
  PAID: 'PAID',
} as const;
export type PayoutStatus = (typeof PayoutStatus)[keyof typeof PayoutStatus];
