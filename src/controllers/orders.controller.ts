import { Request, Response } from "express";
import {
  orderItems,
  orders,
  payments,
  transactions,
  closeOrders,
  promotionList,
  promotion,
  guest,
  logs,
  users,
  paymentMethod,
  promotionCodes,
} from "../config/db/schema.js";
import dotenv from "dotenv";
import axios from "axios";
import { db } from "../config/index.js";
import crypto from "crypto";
import { eq, and, sql, or } from "drizzle-orm";
import { io } from "../index.js";
import { GroupedOrder } from "../types/type.js";
import { Device, IpAddress } from "../utils/ip.js";
import {
  credentials,
  initaitHubtelPay,
  initaitPayStackPay,
} from "../services/paymentServices.js";

dotenv.config();

export const createOrders = async (req: Request, res: Response) => {
  try {
    const {
      order,
      name,
      number,
      deliveryType,
      location,
      note,
      deliveryFee,
      foodCost,
      totalPrice,
      promoId,
      promoCode,
      source,
    } = req.body;

    console.log(req.body);

    if (
      !order ||
      !Array.isArray(order) ||
      order.length === 0 ||
      !name ||
      !number ||
      !deliveryType ||
      !foodCost ||
      !totalPrice ||
      !source
    ) {
      return res.status(400).json({
        message: "Fill all required fields",
      });
    }

    const paymentConfig = await db.select().from(paymentMethod);

    const payment = paymentConfig[0]?.paymentType;

    if (!payment) {
      return res.status(400).json({
        message: "No payment method has been configured yet.",
      });
    }

    const orderReference = crypto.randomBytes(6).toString("hex");

    const now = new Date();

    const toMysqlDatetime = (date: Date) =>
      date.toISOString().slice(0, 19).replace("T", " ");

    let finalAmount = Number(totalPrice);

    if (promoId != null) {
      const promo = (
        await db.select().from(promotion).where(eq(promotion.id, promoId))
      )[0];

      if (!promo) {
        return res.status(400).json({
          message: "Invalid promotion",
        });
      }

      if (!promo.isActive) {
        return res.status(400).json({
          message: "This promotion is inactive",
        });
      }

      if (promo.startAt > now) {
        return res.status(400).json({
          message: "Promotion has not started",
        });
      }

      if (promo.expiresAt < now) {
        return res.status(400).json({
          message: "Promotion has expired",
        });
      }

      const discount = promo.orderDiscount
        ? Number(promo.orderDiscount) / 100
        : 0;

      finalAmount = Number(totalPrice) - Number(totalPrice) * discount;
    }

    const result = await db.transaction(async (tx) => {
      let promoData: any = null;

      if (promoId != null) {
        const updatePromo = await tx
          .update(promotionCodes)
          .set({
            isUsed: true,
          })
          .where(
            and(
              eq(promotionCodes.promotionId, promoId),
              eq(promotionCodes.code, promoCode),
              eq(promotionCodes.isUsed, false),
            ),
          );

        promoData = (
          await tx
            .select()
            .from(promotionCodes)
            .where(
              and(
                eq(promotionCodes.promotionId, promoId),
                eq(promotionCodes.code, promoCode),
              ),
            )
        )[0];

        await tx
          .update(promotion)
          .set({
            usedCount: sql`${promotion.usedCount} + 1`,
          })
          .where(eq(promotion.id, promoId));
      }

      const created = await tx
        .insert(orders)
        .values({
          orderId: orderReference,
          date: Date.now(),
          name,
          phoneNumber: number,
          amount: finalAmount.toString(),
          note,
          location,
          deliveryFee,
          deliveryType,
          priceOfFood: foodCost,
          orderPaid: false,
          completed: false,
          promotion: promoId ? "Promotion Order" : null,
          processedAt: null,
          source,
          createdAt: toMysqlDatetime(now),
          updatedAt: toMysqlDatetime(now),
        })
        .$returningId();

      const orderDbId = created[0]?.id;

      if (!orderDbId) {
        throw new Error("Order ID not found");
      }

      await tx.insert(orderItems).values(
        order.map((item: any) => ({
          ...item,
          orderIdFk: orderDbId,
        })),
      );

      if (promoId != null) {
        const promo = (
          await tx.select().from(promotion).where(eq(promotion.id, promoId))
        )[0];

        if (!promo) {
          throw new Error("Promotion not found");
        }

        await tx.insert(promotionList).values({
          orderId: orderDbId,
          promotionId: promo.id,
          promotionCodeId: promoData?.id,
          code: promo.code,
          type: promo.type,
        });
      }

      await tx.insert(payments).values({
        orderId: orderDbId,
        paymentStatus: "pending",
        totalAmount: finalAmount.toString(),
      });

      await tx.insert(guest).values({
        orderId: orderDbId,
        name,
        phoneNumber: number,
      });

      return {
        orderId: orderDbId,
        finalAmount,
      };
    });

    // let orderId = result.orderId;

    let initPayment;

    if (payment === "Hubtel") {
      initPayment = await initaitHubtelPay({
        number,
        totalPrice: result.finalAmount,
        ordId: result.orderId,
        order,
        location,
        deliveryFee,
        foodCost,
        deliveryType,
        name,
      });
    }

    if (payment === "Paystack") {
      initPayment = await initaitPayStackPay({
        number,
        totalPrice: result.finalAmount,
        ordId: result.orderId,
        order,
        location,
        deliveryFee,
        foodCost,
        deliveryType,
      });
    }

    if (!initPayment || !initPayment.data) {
      await db
        .update(payments)
        .set({
          paymentStatus: "failed",
        })
        .where(eq(payments.orderId, result.orderId));

      throw new Error("Payment initialization failed");
    }

    await db.insert(transactions).values({
      orderId: result.orderId,
      amount: result.finalAmount.toString(),
      status: "pending",
      reference:
        initPayment?.data?.reference ||
        initPayment?.data?.clientReference ||
        null,
      paymentsMethod: payment,
      paymentNumber: number,
    });

    await db
      .update(payments)
      .set({
        paymentStatus: "pending",
      })
      .where(eq(payments.orderId, result.orderId));

    const ip = IpAddress(req);
    const userDevice = Device(req);
    await db.insert(logs).values({
      user: {
        id: result.orderId,
        name,
        email: number,
      },
      action: "Create",
      module: "Order",
      description: `Made an order ${orderReference}`,
      ipAddress: ip,
      device: {
        type: userDevice.type,
        browser: userDevice.browser,
        os: userDevice.os,
      },
      status: "success",
    });

    return res.status(201).json({
      message: "Order Created successfully",
      data: initPayment.data,
      promo: promoId != null ? "Promo has been applied successfully" : null,
    });
  } catch (error) {
    console.error("CREATE ORDER ERROR:", error);
    return res.status(500).json({
      message: "Server error",
      error: error instanceof Error ? error.message : error,
    });
  }
};

export const webhook = async (req: Request, res: Response) => {
  try {
    const secret = process.env.PAYSTACK_SECRET_KEY as string;
    const hash = crypto
      .createHmac("sha512", secret)
      .update(JSON.stringify(req.body))
      .digest("hex");

    if (hash !== req.headers["x-paystack-signature"]) {
      return res.status(400).send("Invalid signature");
    }

    const { event, data } = req.body;

    if (event !== "charge.success") {
      return res.status(200).send("Ignored");
    }

    const result = await db.transaction(async (tx) => {
      const existing = await tx
        .select()
        .from(transactions)
        .where(eq(transactions.reference, data.reference));

      if (!existing.length) return res.status(404).send("Not found");

      if (existing[0]?.status === "success") {
        return res.status(200).send("Already processed");
      }

      await tx
        .update(transactions)
        .set({
          status: "success",
          paymentsMethod: data.authorization?.channel || "unknown",
          paymentNumber: data?.authorization?.mobile_money_number,
        })
        .where(eq(transactions.reference, data.reference))
        .execute();

      await tx
        .update(orders)
        .set({ orderPaid: true, processedAt: sql`now()` })
        .where(eq(orders.id, data.metadata.orderId));

      await tx
        .update(payments)
        .set({ paymentStatus: "success" })
        .where(eq(payments.orderId, data.metadata.orderId));

      io.emit("new-order", existing[0]);
    });

    return res.status(200).json({ message: "Webhook Okay" });
  } catch (error: any) {
    return res
      .status(500)
      .json({ message: "Webhook error", error: error.message });
  }
};

export const hubtelWebhook = async (req: Request, res: Response) => {
  try {
    console.log(req.body);

    const { Status, Data } = req.body;

    if (Status !== "Success") {
      console.log("Payment not successful");
      return res.sendStatus(200);
    }

    console.log(Data);
    const { ClientReference, Amount, PaymentDetails } = Data || {};

    const paymentMethod = PaymentDetails?.PaymentType;
    const paymentNumber = PaymentDetails?.MobileMoneyNumber;

    if (!ClientReference) {
      console.log("Missing ClientReference");
      return res.sendStatus(200);
    }

    const result = await db.transaction(async (tx) => {
      const existing = await tx
        .select()
        .from(transactions)
        .where(eq(transactions.reference, ClientReference));

      if (!existing.length) {
        console.log("Transaction not found:", ClientReference);
        return { status: "not_found" };
      }

      const transaction = existing[0];

      if (Status === "success") {
        console.log("Already processed:", ClientReference);
        return { status: "already_processed" };
      }

      await tx
        .update(transactions)
        .set({
          status: "success",
          paymentsMethod: paymentMethod || "unknown",
          paymentNumber: paymentNumber || 0,
          amount: Amount,
        })
        .where(eq(transactions.reference, ClientReference));

      await tx
        .update(orders)
        .set({ orderPaid: true, processedAt: sql`now()` })
        .where(eq(orders.id, Number(transaction?.orderId)));

      await tx
        .update(payments)
        .set({
          paymentStatus: "success",
        })
        .where(eq(payments.orderId, ClientReference));

      return { status: "success", transaction };
    });

    if (result.status === "not_found") {
      console.log(`Transaction not found: ${ClientReference}`);
      return res.sendStatus(200);
    }

    if (result.status === "already_processed") {
      console.log(`Already processed: ${ClientReference}`);
      return res.sendStatus(200);
    }

    io.emit("new-order", {
      reference: ClientReference,
      status: "success",
    });

    return res.sendStatus(200);
  } catch (error) {
    console.error("Hubtel webhook error:", error);

    if (!res.headersSent) {
      return res.sendStatus(200);
    }
  }
};

export const verifyTransaction = async (req: Request, res: Response) => {
  try {
    const { reference } = req.params;

    if (!reference) {
      return res.status(400).json({ message: "Reference not available" });
    }

    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      },
    );
    const data = response.data;
    return res.status(200).json({
      message: "Transaction Verified",
      data,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
      error,
    });
  }
};
export const statusTransaction = async (req: Request, res: Response) => {
  try {
    const { clientReference } = req.params;

    if (!clientReference) {
      return res.status(400).json({ message: "Reference not available" });
    }

    console.log({
      merchant: process.env.HUBTEL_MERCHANT_ACCOUNT_NUMBER,
      clientReference,
      auth: credentials,
    });

    const statusPayment = await axios.get(
      `https://api-txnstatus.hubtel.com/transacions/${process.env.HUBTEL_MERCHANT_ACCOUNT_NUMBER}/statusclientReference=${clientReference}`,
      {
        headers: {
          Authorization: `Basic ${credentials}`,
          "Content-Type": "application/json",
        },
      },
    );

    console.log(statusPayment);

    const data = statusPayment.data;
    return res.status(200).json({
      message: "Transaction Verified",
      data,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal serer error",
      hubtelError: error,
    });
  }
};

export const pendingOrders = async (req: Request, res: Response) => {
  try {
    const ordersPending = await db
      .select()
      .from(orders)
      .innerJoin(orderItems, eq(orderItems.orderIdFk, orders.id))
      .innerJoin(transactions, eq(transactions.orderId, orders.id))
      .where(
        and(eq(transactions.status, "success"), eq(orders.completed, false)),
      );

    const result: Record<number, GroupedOrder> = {};

    ordersPending.forEach((curr) => {
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
    res.status(200).json({ data: ordersArray });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
};

export const deliveredOrders = async (req: Request, res: Response) => {
  try {
    const ordersDelivered = await db
      .select()
      .from(orders)
      .innerJoin(orderItems, eq(orders.id, orderItems.orderIdFk))
      // .innerJoin(transactions, eq(transactions.orderId, orders.id))
      .where(eq(orders.completed, true));

    const result: Record<number, GroupedOrder> = {};

    ordersDelivered.forEach((curr) => {
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
    res.status(200).json({ data: ordersArray });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
};

export const FailedOrders = async (req: Request, res: Response) => {
  try {
    const failedOrders = await db
      .select()
      .from(orders)
      .innerJoin(orderItems, eq(orderItems.orderIdFk, orders.id))
      .innerJoin(transactions, eq(transactions.orderId, orders.id))
      .innerJoin(payments, eq(payments.orderId, orders.id))
      .where(
        and(
          or(
            eq(transactions.status, "pending"),
            eq(transactions.status, "failed"),
          ),
          or(
            eq(payments.paymentStatus, "pending"),
            eq(payments.paymentStatus, "failed"),
          ),
          eq(orders.completed, false),
        ),
      );

    const result: Record<number, GroupedOrder> = {};

    failedOrders.forEach((curr) => {
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
    res.status(200).json({ data: ordersArray });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
};

export const deliveredStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    const orderId = Number(id);
    if (!orderId || !userId)
      return res
        .status(400)
        .json({ message: "Order Id and User Id is required" });
    const order = await db
      .update(orders)
      .set({
        completed: true,
      })
      .where(eq(orders.id, orderId));

    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, Number(userId)));

    const ip = IpAddress(req);
    const userDevice = Device(req);

    await db.insert(logs).values({
      user: {
        id: Number(user[0]?.id),
        name: user[0]?.name ?? "",
        email: user[0]?.email ?? "",
      },
      action: "Complete",
      module: "Order",
      description: `Delivered order ${orderId}`,
      ipAddress: ip,
      device: {
        type: userDevice.type,
        browser: userDevice.browser,
        os: userDevice.os,
      },
      status: "success",
    });

    res
      .status(200)
      .json({ message: "Delivery Status Changed to Delivered", data: order });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error", error });
  }
};

export const cancelStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    const orderId = Number(id);
    if (!orderId) {
      return res.status(400).json({ message: "Id is required" });
    }

    const order = await db
      .update(orders)
      .set({
        completed: null,
      })
      .where(eq(orders.id, orderId));

    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, Number(userId)));

    const ip = IpAddress(req);
    const userDevice = Device(req);

    await db.insert(logs).values({
      user: {
        id: Number(user[0]?.id),
        name: user[0]?.name ?? "",
        email: user[0]?.email ?? "",
      },
      action: "Cancel",
      module: "Order",
      description: `Cancelled order ${orderId}`,
      ipAddress: ip,
      device: {
        type: userDevice.type,
        browser: userDevice.browser,
        os: userDevice.os,
      },
      status: "success",
    });

    return res.status(200).json({
      message: "Cancelled successfully",
      data: order,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
      error,
    });
  }
};

export const closeOrder = async (req: Request, res: Response) => {
  try {
    const close = await db.select().from(closeOrders);
    res.status(200).json({ data: close[0] });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
};

export const changeOrderStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { close, userId } = req.body;

    const closeId = Number(id);
    if (isNaN(closeId)) return res.status(400).json({ message: "Invalid id" });
    if (!close) return res.status(400).json({ message: "value is required" });

    const updated = await db
      .update(closeOrders)
      .set({ closeOrders: close })
      .where(eq(closeOrders.id, closeId));

    io.emit("orders-close");

    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, Number(userId)));

    const ip = IpAddress(req);
    const userDevice = Device(req);

    await db.insert(logs).values({
      user: {
        id: Number(user[0]?.id),
        name: user[0]?.name ?? "",
        email: user[0]?.email ?? "",
      },
      action: `${close}`,
      module: "Order",
      description: `${close} order`,
      ipAddress: ip,
      device: {
        type: userDevice.type,
        browser: userDevice.browser,
        os: userDevice.os,
      },
      status: "success",
    });

    res.status(200).json({ data: updated[0] });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
};

export const deleteStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    const orderId = Number(id);
    const parsedUserId = Number(userId);

    if (!orderId) {
      return res.status(400).json({ message: "Id is required" });
    }
    await db.delete(orders).where(eq(orders.id, orderId));

    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, parsedUserId));

    const ip = IpAddress(req);
    const userDevice = Device(req);

    await db.insert(logs).values({
      user: {
        id: Number(user[0]?.id),
        name: user[0]?.name ?? "",
        email: user[0]?.email ?? "",
      },
      action: "Delete",
      module: "Order",
      description: `Order ${orderId} Deleted`,
      ipAddress: ip,
      device: {
        type: userDevice.type,
        browser: userDevice.browser,
        os: userDevice.os,
      },
      status: "success",
    });

    return res.status(200).json({ message: "Deleted Order" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
      error,
    });
  }
};
