export type OrderType = {
  id: number;
  orderId: string;
  date: number;
  name: string;
  phoneNumber: string;
  location: string;
  deliveryType: string | null;
  note: string | null;
  deliveryFee: string;
  priceOfFood: string;
  amount: string;
  orderPaid: boolean;
  completed: boolean | null;
  promotion: string | null;
  createdAt: string;
  updatedAt: string;
};

export type OrderItemType = {
  id: number;
  orderIdFk: number | null;
  foodName: string;
  quantity: number;
  unitPrice: string | null;
};

export type GroupedOrder = {
  orders: OrderType;
  orderItems: OrderItemType[];
};

export type PromotionType = {
  id?: number;
  code: string;
  type: string;
  limits: number;
  minOrderAmount: number;
  minOrder: number;
  usedCount: number;
  expiresAt: Date;
  isActive: boolean;
};
