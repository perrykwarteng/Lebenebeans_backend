import { Request, Response } from "express";
import { db } from "../config/index.js";
import { paymentMethod } from "../config/db/schema.js";

export const getPaymentMethod = async (req: Request, res: Response) => {
  try {
    const payment = await db.select().from(paymentMethod);
    res.status(200).json({
      message: "Returned Payment Method Successfully",
      data: {
        id: payment[0]?.id,
        paymentType: payment[0]?.paymentType,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
};

export const changePayment = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { paymentMeth } = req.body;
  if (!id) {
    return res.status(400).json({ messgae: "Missing Payment ID" });
  }
  if (!paymentMeth) {
    return res.status(400).json({ messgae: "Payment Method not passed" });
  }

  try {
    const changePaymentMethod = await db.update(paymentMethod).set({
      paymentType: paymentMeth,
    });

    return res.json({
      message: "Change Payment Method Successfully",
      data: changePaymentMethod,
    });
  } catch (err) {
    return res.status(500).json({ message: "Reset failed" });
  }
};
