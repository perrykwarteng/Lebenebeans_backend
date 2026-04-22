import { Request, Response } from "express";
import { db } from "../config/index.js";
import { guest, orderItems, orders } from "../config/db/schema.js";
import { and, eq } from "drizzle-orm";
import { GroupedOrder } from "../types/type.js";

export const getGuest = async (req: Request, res: Response) => {
  try {
    const { phone } = req.query;

    if (!phone) return res.status(400).json({ message: "No number parsed" });

    const guestUser = await db
      .select()
      .from(guest)
      .where(eq(guest.phoneNumber, Number(phone)));

    const user = guestUser[0];
    console.log(user);

    res.status(200).json({ message: "Retured Guest Successfully", user });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error instanceof Error ? error.message : error,
    });
  }
};

export const getGuestHistory = async (req: Request, res: Response) => {
  try {
    const phone = req.query.phone as string;

    if (!phone) return res.status(400).json({ message: "No number parsed" });

    const history = await db
      .select()
      .from(orders)
      .innerJoin(orderItems, eq(orderItems.orderIdFk, orders.id))
      .innerJoin(guest, eq(guest.orderId, orders.id))
      .where(
        and(eq(guest.phoneNumber, Number(phone)), eq(orders.orderPaid, true)),
      );

    const result: Record<number, GroupedOrder> = {};

    history.forEach((curr) => {
      const id = curr.orders.id;

      if (!result[id]) {
        result[id] = {
          orders: curr.orders,
          orderItems: [],
        };
      }

      result[id].orderItems.push({
        id: curr.order_items.id,
        orderIdFk: curr.order_items.orderIdFk,
        foodName: curr.order_items.foodName,
        quantity: curr.order_items.quantity,
        unitPrice: curr.order_items.unitPrice,
      });
    });

    const ordersArray = Object.values(result).reverse();

    res.status(200).json({ message: "Return all guest history", ordersArray });
  } catch (error) {}
};
