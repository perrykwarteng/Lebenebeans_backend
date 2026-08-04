import { Request, Response } from "express";
import { db } from "../config/index.js";
import { promotion, promotionCodes } from "../config/db/schema.js";
import { and, eq } from "drizzle-orm";
import { bulkGeneratePromotionCodes } from "../utils/generateCode.js";
import dotenv from "dotenv";

dotenv.config();

export const createPromotion = async (req: Request, res: Response) => {
  try {
    const {
      code,
      type,
      limits,
      minOrderAmount,
      discount,
      minOrder,
      usedCount,
      startAt,
      expiresAt,
      isActive,
    } = req.body;

    if (!code || !type || !expiresAt || isActive === undefined) {
      return res.status(400).json({
        message:
          "promotion code, type, expiresAt, and isActive are required fields",
      });
    }

    const promotionExist = await db
      .select()
      .from(promotion)
      .where(eq(promotion.code, code));

    if (promotionExist.length > 0) {
      return res
        .status(400)
        .json({ message: "This promotion offer already exists" });
    }

    await db.insert(promotion).values({
      code,
      type,
      limits: limits ? Number(limits) : null,
      minOrderAmount: minOrderAmount ? String(minOrderAmount) : null,
      orderDiscount: discount ? String(discount) : null,
      minOrder: minOrder ? Number(minOrder) : null,
      usedCount: usedCount ? Number(usedCount) : 0,
      startAt: new Date(startAt),
      expiresAt: new Date(expiresAt),
      isActive: Boolean(isActive),
    });

    return res.status(201).json({
      message: "Created Promo successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error instanceof Error ? error.message : error,
    });
  }
};

export const getPromotion = async (req: Request, res: Response) => {
  try {
    const code = req.query.code as string;
    const type = req.query.type as string;
    const promoCode = (req.query.promocode as string) || null;

    if (!code || !type) {
      return res.status(400).json({
        message: "Promotion code and promotion type are required.",
      });
    }

    const nowDate = new Date();

    const getPromo = await db
      .select({
        id: promotion.id,
        code: promotion.code,
        type: promotion.type,
        limits: promotion.limits,
        minOrderAmount: promotion.minOrderAmount,
        orderDiscount: promotion.orderDiscount,
        minOrder: promotion.minOrder,
        usedCount: promotion.usedCount,
        startAt: promotion.startAt,
        expiresAt: promotion.expiresAt,
        isActive: promotion.isActive,
      })
      .from(promotion)
      .where(and(eq(promotion.code, code), eq(promotion.type, type)));

    if (getPromo.length === 0) {
      return res.status(400).json({
        message: "Promotion not found.",
      });
    }

    const promo = getPromo[0];

    if (!promo?.isActive) {
      return res.status(400).json({
        message: "This promotion is inactive.",
      });
    }

    if (promo?.startAt > nowDate) {
      return res.status(400).json({
        message: "Sorry, this promotion has not started yet.",
      });
    }

    if (promo?.expiresAt < nowDate) {
      return res.status(400).json({
        message: "Sorry, this promotion has expired.",
      });
    }

    let promotionCode = null;

    if (promoCode) {
      const codes = await db
        .select()
        .from(promotionCodes)
        .where(
          and(
            eq(promotionCodes.promotionId, promo.id),
            eq(promotionCodes.code, promoCode),
          ),
        );

      if (codes.length === 0) {
        return res.status(400).json({
          message: "Invalid promotion code.",
        });
      }

      promotionCode = codes[0];

      if (promotionCode?.isUsed) {
        return res.status(400).json({
          message: "Sorry, this promotion code has already been used.",
        });
      }
    }

    return res.status(200).json({
      message: "Promotion retrieved successfully.",
      data: {
        id: promo.id,
        code: promo.code,
        type: promo.type,
        limits: promo.limits,
        minOrderAmount: promo.minOrderAmount,
        orderDiscount: promo.orderDiscount,
        minOrder: promo.minOrder,
        usedCount: promo.usedCount,
        startAt: promo.startAt,
        expiresAt: promo.expiresAt,
        hasStarted: promo.startAt <= nowDate,
        hasExpired: promo.expiresAt < nowDate,
        isActive: promo.isActive,
        promoCode: promotionCode?.code ?? null,
        promoCodeUsed: promotionCode?.isUsed ?? null,
      },
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Server error",
      error: error instanceof Error ? error.message : error,
    });
  }
};

export const setPromotionStatus = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { isActive } = req.body as {
      isActive: boolean;
    };

    if (!id)
      return res.status(400).json({ message: "Promotion ID is missing " });

    const updatePromotion = await db
      .update(promotion)
      .set({
        isActive,
      })
      .where(eq(promotion.id, Number(id)));

    res.status(200).json({
      message: "Changed IsActive Successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error instanceof Error ? error.message : error,
    });
  }
};

export const generatePromotionCodes = async (req: Request, res: Response) => {
  const { promotionId, count, prefix, size } = req.body;

  if (!count || !prefix || !size) {
    return res.status(400).json({
      message: "Sorry count, prefix and size are required",
    });
  }

  try {
    const [promo] = await db
      .select()
      .from(promotion)
      .where(eq(promotion.id, promotionId));

    const generated = await bulkGeneratePromotionCodes({
      promotionId,
      count: count,
      code: promo?.code ?? "",
      type: promo?.type ?? "",
      baseUrl: process.env.FRONTEND_URL ?? "https://lebenebeans.com",
      prefix: prefix,
      chunkSize: size,
    });

    let Links: string[] = [];
    generated.forEach((element) => {
      Links.push(element.promoLink);
    });

    res.status(201).json({
      data: {
        data: generated,
        Links,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error instanceof Error ? error.message : error,
    });
  }
};
