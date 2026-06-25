import axios from "axios";

import dotenv from "dotenv";

dotenv.config();

export const credentials = Buffer.from(
  `${process.env.HUBTEL_APP_ID}:${process.env.HUBTEL_SECRET_KEY}`,
).toString("base64");

export const initaitPayStackPay = async (data: {
  number: number;
  totalPrice: number;
  ordId: number;
  order: any[];
  location: string;
  deliveryFee: number;
  foodCost: number;
  deliveryType: string;
}) => {
  try {
    const initaitPayment = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email: `${data.number}@customer.com`,
        amount: data.totalPrice * 100,
        callback_url: process.env.PAYSTACK_CALLBACK_URL,
        metadata: {
          orderId: data.ordId,
          orderItems: data.order,
          deliveryLocation: data.location || "No location",
          deliveryFee: data.deliveryFee || 0,
          foodCost: data.foodCost,
          deliveryType: data.deliveryType,
          phoneNumber: data.number,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      },
    );

    return initaitPayment.data;
  } catch (error) {
    console.error("Paystack Payment initiation failed", error);
    throw new Error("Failed to initiate payment");
  }
};

export const initaitHubtelPay = async (data: {
  number: number;
  totalPrice: number;
  ordId: number;
  order: any[];
  location: string;
  deliveryFee: number;
  foodCost: number;
  deliveryType: string;
  name?: string;
}) => {
  try {
    const dataDisplay = JSON.stringify(data);

    const initaitPayment = await axios.post(
      "https://payproxyapi.hubtel.com/items/initiate",
      {
        totalAmount: data.totalPrice,
        description: `Payment of #Order:${data.ordId}`,
        callbackUrl: process.env.HUBTEL_CALLBACK_URL,
        returnUrl: process.env.HUBTEL_RETURN_URL,
        merchantAccountNumber: process.env.HUBTEL_MERCHANT_ACCOUNT_NUMBER,
        cancellationUrl: process.env.HUBTEL_RETURN_URL,
        clientReference: data.ordId.toString(),
        payeeMobileNumber: data.number,
        payeeName: data.name,
      },
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Basic ${credentials}`,
          "Cache-Control": "no-cache",
        },
      },
    );

    return initaitPayment.data;
  } catch (error: any) {
    console.error(
      "Payment initiation failed:",
      error.response?.data || error.message,
    );
    throw error;
  }
};
