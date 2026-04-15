import {
  mysqlTable,
  unique,
  serial,
  mysqlEnum,
  bigint,
  varchar,
  decimal,
  datetime,
  int,
  text,
  timestamp,
  boolean,
} from "drizzle-orm/mysql-core";

export const closeOrders = mysqlTable("closeOrders", {
  id: serial().notNull().primaryKey(),
  closeOrders: mysqlEnum(["close", "open"]).notNull(),
});

export const deliveryLocations = mysqlTable("delivery_locations", {
  id: bigint({ mode: "number", unsigned: true })
    .autoincrement()
    .notNull()
    .primaryKey(),
  name: varchar({ length: 255 }).notNull(),
  price: decimal({ precision: 10, scale: 2 }).default("0.00").notNull(),
  createdAt: datetime({ mode: "string" }).notNull(),
  updatedAt: datetime({ mode: "string" }).notNull(),
});

export const orderItems = mysqlTable("order_items", {
  id: bigint({ mode: "number", unsigned: true })
    .autoincrement()
    .notNull()
    .primaryKey(),
  orderIdFk: bigint({ mode: "number", unsigned: true })
    .notNull()
    .references(() => orders.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  foodName: varchar({ length: 255 }).notNull(),
  quantity: int().default(1).notNull(),
  unitPrice: decimal({ precision: 10, scale: 2 }),
});

export const orders = mysqlTable(
  "orders",
  {
    id: bigint({ mode: "number", unsigned: true })
      .autoincrement()
      .notNull()
      .primaryKey(),
    orderId: varchar({ length: 64 }).notNull(),
    date: bigint({ mode: "number" }).notNull(),
    name: varchar({ length: 255 }).notNull(),
    phoneNumber: varchar({ length: 32 }).notNull(),
    amount: decimal({ precision: 10, scale: 2 }).notNull(),
    note: text(),
    completed: boolean().default(false),
    location: varchar({ length: 255 }).notNull(),
    deliveryType: varchar({ length: 64 }),
    deliveryFee: decimal({ precision: 10, scale: 2 }).default("0.00").notNull(),
    priceOfFood: decimal({ precision: 10, scale: 2 }).default("0.00").notNull(),
    orderPaid: boolean().default(false).notNull(),
    promotion: varchar({ length: 64 }),
    createdAt: datetime({ mode: "string" }).notNull(),
    updatedAt: datetime({ mode: "string" }).notNull(),
    legacyId: varchar({ length: 128 }),
  },
  (table) => [
    unique("legacyId").on(table.legacyId),
    unique("legacyId_10").on(table.legacyId),
    unique("legacyId_11").on(table.legacyId),
    unique("legacyId_12").on(table.legacyId),
    unique("legacyId_13").on(table.legacyId),
    unique("legacyId_14").on(table.legacyId),
    unique("legacyId_2").on(table.legacyId),
    unique("legacyId_3").on(table.legacyId),
    unique("legacyId_4").on(table.legacyId),
    unique("legacyId_5").on(table.legacyId),
    unique("legacyId_6").on(table.legacyId),
    unique("legacyId_7").on(table.legacyId),
    unique("legacyId_8").on(table.legacyId),
    unique("legacyId_9").on(table.legacyId),
    unique("orderId").on(table.orderId),
    unique("orderId_10").on(table.orderId),
    unique("orderId_11").on(table.orderId),
    unique("orderId_12").on(table.orderId),
    unique("orderId_13").on(table.orderId),
    unique("orderId_14").on(table.orderId),
    unique("orderId_15").on(table.orderId),
    unique("orderId_2").on(table.orderId),
    unique("orderId_3").on(table.orderId),
    unique("orderId_4").on(table.orderId),
    unique("orderId_5").on(table.orderId),
    unique("orderId_6").on(table.orderId),
    unique("orderId_7").on(table.orderId),
    unique("orderId_8").on(table.orderId),
    unique("orderId_9").on(table.orderId),
  ],
);

export const payments = mysqlTable("payments", {
  id: bigint({ mode: "number", unsigned: true })
    .autoincrement()
    .notNull()
    .primaryKey(),
  orderId: bigint({ mode: "number", unsigned: true }).references(
    () => orders.id,
  ),
  paymentStatus: mysqlEnum(["pending", "success", "failed"]).notNull(),
  totalAmount: decimal({ precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp({ mode: "string" }).defaultNow().notNull(),
});

export const transactions = mysqlTable("transactions", {
  id: bigint({ mode: "number", unsigned: true })
    .autoincrement()
    .notNull()
    .primaryKey(),
  orderId: bigint({ mode: "number", unsigned: true }).references(
    () => orders.id,
  ),
  amount: decimal({ precision: 10, scale: 2 }).notNull(),
  status: mysqlEnum(["pending", "success", "failed"]).notNull(),
  reference: varchar({ length: 255 }),
  paymentsMethod: varchar({ length: 255 }),
  createdAt: timestamp({ mode: "string" }).defaultNow().notNull(),
});

export const users = mysqlTable("users", {
  id: bigint({ mode: "number", unsigned: true })
    .autoincrement()
    .notNull()
    .primaryKey(),
  name: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  password: varchar({ length: 255 }).notNull(),
  role: mysqlEnum(["admin", "user"]).notNull(),
});

export const promotion = mysqlTable("promotion", {
  id: bigint({ mode: "number", unsigned: true })
    .autoincrement()
    .notNull()
    .primaryKey(),
  code: varchar({ length: 255 }).notNull(),
  type: varchar({ length: 255 }).notNull(),
  limits: bigint({ mode: "number" }),
  minOrderAmount: bigint({ mode: "number" }),
  orderDiscount: bigint({ mode: "number" }),
  minOrder: bigint({ mode: "number" }),
  usedCount: bigint({ mode: "number" }).default(0).notNull(),
  startAt: datetime().notNull(),
  expiresAt: datetime().notNull(),
  isActive: boolean().default(false).notNull(),
  createdAt: timestamp({ mode: "string" }).defaultNow().notNull(),
});

export const promotionList = mysqlTable("promotionList", {
  id: bigint({ mode: "number", unsigned: true })
    .autoincrement()
    .notNull()
    .primaryKey(),
  orderId: bigint({ mode: "number" }).references(() => orders.id),
  promotionId: bigint({ mode: "number" }).references(() => promotion.id),
  code: varchar({ length: 255 }).notNull(),
  type: varchar({ length: 255 }).notNull(),
  createdAt: timestamp({ mode: "string" }).defaultNow().notNull(),
});
