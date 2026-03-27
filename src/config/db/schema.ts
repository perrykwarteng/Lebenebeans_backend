import {
  boolean,
  decimal,
  int,
  mysqlEnum,
  mysqlTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

const roleEnum = mysqlEnum("role", ["admin", "user"]);
const transactionStatusEnum = mysqlEnum("transactionStatus", [
  "pending",
  "success",
  "failed",
]);

export const users = mysqlTable("users", {
  id: serial().primaryKey(),
  name: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).unique().notNull(),
  password: varchar({ length: 255 }).notNull(),
  role: roleEnum.notNull(),
});

export const orders = mysqlTable("orders", {
  id: serial().primaryKey(),
  name: varchar({ length: 255 }).notNull(),
  number: varchar({ length: 255 }).notNull(),
  location: varchar({ length: 255 }).notNull(),
  deliveryType: varchar({ length: 255 }).notNull(),
  note: text(),
  orderDelivered: boolean().notNull(),
  deliveryFee: decimal().notNull(),
  foodCost: decimal().notNull(),
  totalPrice: decimal().notNull(),
  createdAt: timestamp().notNull().defaultNow(),
});

export const orderItems = mysqlTable("orderItems", {
  id: serial().primaryKey(),
  orderId: int().references(() => orders.id),
  foodName: varchar({ length: 255 }).notNull(),
  quantity: int().notNull(),
  price: decimal().notNull(),
});

export const payments = mysqlTable("payments", {
  id: serial().primaryKey(),
  orderId: int().references(() => orders.id),
  paymentStatus: transactionStatusEnum.notNull(),
  totalAmount: decimal().notNull(),
  createdAt: timestamp().notNull().defaultNow(),
});

export const transactions = mysqlTable("transactions", {
  id: serial().primaryKey(),
  orderId: int().references(() => orders.id),
  amount: decimal().notNull(),
  status: transactionStatusEnum.notNull(),
  reference: varchar({ length: 255 }),
  paymentsMethod: varchar({ length: 255 }),
  createdAt: timestamp().notNull().defaultNow(),
});
