import { Request, Response } from "express";
import {
  orderItems,
  orders,
  payments,
  transactions,
} from "../config/db/schema.js";
import dotenv from "dotenv";
import axios from "axios";
import { eq } from "drizzle-orm";
import { db } from "../config/index.js";

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
    } = req.body;

    if (
      !order ||
      !Array.isArray(order) ||
      order.length === 0 ||
      !name ||
      !number ||
      !deliveryType ||
      !location ||
      !deliveryFee ||
      !foodCost ||
      !totalPrice
    ) {
      return res.status(400).json({ message: "Fill all required fields" });
    }

    const createOrder = await db
      .insert(orders)
      .values({
        name,
        number,
        location,
        deliveryType,
        note,
        orderDelivered: false,
        deliveryFee,
        foodCost,
        totalPrice,
      })
      .$returningId();

    const orderId = createOrder[0]?.id;

    await db
      .insert(orderItems)
      .values(order.map((item) => ({ ...item, orderId })));

    await db.insert(payments).values({
      orderId,
      paymentStatus: "pending",
      totalAmount: totalPrice,
    });

    const initaitPayment = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email: `${number}@customer.com`,
        amount: totalPrice * 100,
        callback_url: process.env.PAYSTACK_CALLBACK_URL,
        metadata: {
          orderId: orderId,
          orderItems: order,
          deliveryLocation: location,
          deliveryFee: deliveryFee,
          foodCost: foodCost,
          deliveryType: deliveryType,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (initaitPayment.data.status === true) {
      await db.insert(transactions).values({
        orderId,
        amount: totalPrice,
        status: "pending",
        reference: initaitPayment.data.data.reference,
        paymentsMethod: "",
      });
    } else {
      res.status(400).json({
        message: "Failed initiating Payment",
        data: initaitPayment.data,
      });
    }

    res.status(201).json({
      message: "Order Ceated successfully",
      data: initaitPayment.data,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
};

export const verifyTransaction = async (req: Request, res: Response) => {
  try {
    const { reference } = req.params;

    if (!reference)
      return res.status(400).json({ message: "Reference not available" });
    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (response.data.status === true) {
      await db
        .update(transactions)
        .set({
          status: "success",
          paymentsMethod: response.data.data.channel,
        })
        .where(eq(transactions.reference, response.data.data.reference));

      await db
        .update(payments)
        .set({
          paymentStatus: "success",
        })
        .where(eq(payments.orderId, response.data.data.metadata.orderId));
    } else {
      await db.update(transactions).set({
        status: "failed",
      });

      await db.update(payments).set({
        paymentStatus: "failed",
      });
    }

    res.status(200).json({
      message: "Transaction Verified",
      data: response.data,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
};
