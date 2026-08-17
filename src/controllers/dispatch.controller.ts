import { Request, Response } from "express";
import { and, eq, isNull, lte, sql, inArray, gte, or } from "drizzle-orm";
import { db } from "../config/index.js";
import {
  assignOrders,
  logs,
  orderItems,
  orders,
  riders,
  users,
} from "../config/db/schema.js";
import { parseDateRange } from "../utils/dateRange.js";
import { Device, IpAddress } from "../utils/ip.js";

export const allAssaignOrdeer = async (req: Request, res: Response) => {
  try {
    const { from, to } = req.query;

    const { startDate, endDate } = parseDateRange(from as string, to as string);

    const conditions = [
      and(
        eq(orders.completed, true),
        or(
          eq(orders.deliveryType, "delivery"),
          eq(orders.deliveryType, "Dispatch Rider"),
        ),
      ),
    ];

    if (startDate) {
      const start = String(startDate).split("T")[0];

      conditions.push(gte(orders.createdAt, `${start} 00:00:00`));
    }

    if (endDate) {
      const end = String(endDate).split("T")[0];

      conditions.push(lte(orders.createdAt, `${end} 23:59:59`));
    }

    const assignedOrders = await db
      .select({
        assignmentId: assignOrders.id,
        orderId: orders.id,
        riderId: riders.id,
        riderName: riders.riderName,
        assignedAt: assignOrders.createdAt,
        total: orders.amount,
        priceOfFood: orders.priceOfFood,
        promotion: orders.promotion,

        name: orders.name,
        number: orders.phoneNumber,
        location: orders.location,
        deliveryFee: orders.deliveryFee,
        createdAt: orders.createdAt,

        foodName: orderItems.foodName,
        quantity: orderItems.quantity,
        unitPrice: orderItems.unitPrice,
      })
      .from(assignOrders)
      .innerJoin(orders, eq(assignOrders.orderId, orders.id))
      .innerJoin(riders, eq(assignOrders.riderId, riders.id))
      .leftJoin(orderItems, eq(orders.id, orderItems.orderIdFk))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(sql`${orders.createdAt} DESC`);

    const groupedOrders = Object.values(
      assignedOrders.reduce((acc: any, item) => {
        if (!acc[item.orderId]) {
          acc[item.orderId] = {
            assignmentId: item.assignmentId,
            orderId: item.orderId,
            riderId: item.riderId,
            riderName: item.riderName,
            assignedAt: item.assignedAt,
            totalAmount: item.total,
            priceOfFood: item.priceOfFood,
            promotion: item.promotion,

            name: item.name,
            number: item.number,
            location: item.location,
            deliveryFee: item.deliveryFee,
            createdAt: item.createdAt,

            items: [],
          };
        }

        if (item.foodName) {
          acc[item.orderId].items.push({
            foodName: item.foodName,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          });
        }

        return acc;
      }, {}),
    );

    return res.status(200).json({
      message: "Assigned orders retrieved successfully",
      data: groupedOrders.reverse(),
    });
  } catch (error) {
    console.error("Get Assigned Orders Error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const allNotAssignedOrdeer = async (req: Request, res: Response) => {
  try {
    const { from, to } = req.query;

    const { startDate, endDate } = parseDateRange(from as string, to as string);

    const conditions = [
      isNull(assignOrders.id),
      and(
        eq(orders.completed, true),
        or(
          eq(orders.deliveryType, "delivery"),
          eq(orders.deliveryType, "Dispatch Rider"),
        ),
      ),
    ];

    if (startDate) {
      const start = String(startDate).split("T")[0];

      conditions.push(gte(orders.createdAt, `${start} 00:00:00`));
    }

    if (endDate) {
      const end = String(endDate).split("T")[0];

      conditions.push(lte(orders.createdAt, `${end} 23:59:59`));
    }

    const unassignedOrders = await db
      .select({
        orderId: orders.id,
        name: orders.name,
        number: orders.phoneNumber,
        location: orders.location,
        deliveryFee: orders.deliveryFee,
        createdAt: orders.createdAt,
        total: orders.amount,
        priceOfFood: orders.priceOfFood,
        promotion: orders.promotion,

        orderItemId: orderItems.id,
        foodName: orderItems.foodName,
        quantity: orderItems.quantity,
        unitPrice: orderItems.unitPrice,
      })
      .from(orders)
      .leftJoin(assignOrders, eq(orders.id, assignOrders.orderId))
      .leftJoin(orderItems, eq(orders.id, orderItems.orderIdFk))
      .where(and(...conditions))
      .orderBy(sql`${orders.createdAt} DESC`);

    const groupedOrders = Object.values(
      unassignedOrders.reduce((acc: any, item) => {
        if (!acc[item.orderId]) {
          acc[item.orderId] = {
            orderId: item.orderId,
            name: item.name,
            number: item.number,
            location: item.location,
            deliveryFee: item.deliveryFee,
            totalAmount: item.total,
            priceOfFood: item.priceOfFood,
            promotion: item.promotion,
            createdAt: item.createdAt,
            items: [],
          };
        }

        if (item.foodName) {
          acc[item.orderId].items.push({
            id: item.orderItemId,
            foodName: item.foodName,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          });
        }

        return acc;
      }, {}),
    );

    return res.status(200).json({
      message: "Unassigned orders retrieved successfully",
      data: groupedOrders.reverse(),
    });
  } catch (error) {
    console.error("Get Unassigned Orders Error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const assignOrderRider = async (req: Request, res: Response) => {
  try {
    const { data } = req.body;

    const orderId = data.orderId;
    const riderId = data.riderId;
    const userId = data.userId;

    if (!orderId || !riderId) {
      return res.status(400).json({
        message: "orderId and riderId are required",
      });
    }

    const order = await db
      .select({
        id: orders.id,
      })
      .from(orders)
      .where(eq(orders.id, Number(orderId)))
      .limit(1);

    if (order.length === 0) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    const rider = await db
      .select({
        id: riders.id,
        riderName: riders.riderName,
      })
      .from(riders)
      .where(eq(riders.id, Number(riderId)))
      .limit(1);

    if (rider.length === 0) {
      return res.status(404).json({
        message: "Rider not found",
      });
    }

    const existingAssignment = await db
      .select({
        id: assignOrders.id,
        riderId: assignOrders.riderId,
      })
      .from(assignOrders)
      .where(eq(assignOrders.orderId, Number(orderId)))
      .limit(1);

    if (existingAssignment.length > 0) {
      return res.status(409).json({
        message: "Order is already assigned to a rider",
      });
    }

    await db.insert(assignOrders).values({
      orderId: Number(orderId),
      riderId: Number(riderId),
    });

    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, Number(userId)));

    const ip = IpAddress(req);
    const userDevice = Device(req);
    await db.insert(logs).values({
      user: {
        id: Number(userId),
        name: user[0]?.name ?? "",
        email: user[0]?.email ?? "np",
      },
      action: "Assign",
      module: "Delivery",
      description: `Assigned order ${orderId} to rider ${rider[0]?.riderName}`,
      ipAddress: ip,
      device: {
        type: userDevice.type,
        browser: userDevice.browser,
        os: userDevice.os,
      },
      status: "success",
    });

    return res.status(201).json({
      message: "Order assigned to rider successfully",
    });
  } catch (error) {
    console.error("Assign Order Error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const getRiders = async (req: Request, res: Response) => {
  try {
    const data = await db
      .select({
        id: riders.id,
        riderName: riders.riderName,
        riderNumber: riders.riderNumber,
        createdAt: riders.createdAt,
      })
      .from(riders);

    return res.status(200).json({
      message: "Riders retrieved successfully",
      data,
    });
  } catch (error) {
    console.error("Get Riders Error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const addRider = async (req: Request, res: Response) => {
  try {
    const { data } = req.body;

    if (!data.name || !data.name?.trim()) {
      return res.status(400).json({
        message: "Rider name is required",
      });
    }

    const riderName = data.name?.trim();
    const riderNumber = data.number?.trim();

    const result = await db.insert(riders).values({
      riderName,
      riderNumber,
    });

    return res.status(201).json({
      message: "Rider added successfully",
      data: {
        id: result[0].insertId,
        riderName,
      },
    });
  } catch (error) {
    console.error("Add Rider Error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const deleteRider = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        message: "Rider ID is required",
      });
    }

    const rider = await db
      .select({
        id: riders.id,
        riderName: riders.riderName,
      })
      .from(riders)
      .where(eq(riders.id, Number(id)))
      .limit(1);

    if (rider.length === 0) {
      return res.status(404).json({
        message: "Rider not found",
      });
    }

    await db.delete(riders).where(eq(riders.id, Number(id)));

    return res.status(200).json({
      message: "Rider deleted successfully",
    });
  } catch (error) {
    console.error("Delete Rider Error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};
