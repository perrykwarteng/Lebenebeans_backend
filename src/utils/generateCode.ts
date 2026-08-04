import { promotionCodes } from "../config/db/schema.js";
import { db } from "../config/index.js";

interface BulkGenerateOptions {
  promotionId: number;
  count: number;
  type: string;
  code: string;
  baseUrl: string;
  prefix?: string;
  chunkSize?: number;
}

export async function bulkGeneratePromotionCodes({
  promotionId,
  count,
  type,
  code,
  baseUrl,
  prefix = "PROM",
  chunkSize = 1000,
}: BulkGenerateOptions) {
  const uniqueCodes = new Set<string>();

  while (uniqueCodes.size < count) {
    const randomNumeric = Math.floor(
      1000000000 + Math.random() * 9000000000,
    ).toString();
    uniqueCodes.add(randomNumeric);
  }

  const codeArray = Array.from(uniqueCodes).map((promocode) => {
    const url = new URL(baseUrl);
    url.searchParams.append("code", code);
    url.searchParams.append("type", type);
    url.searchParams.append("promocode", `${prefix}${promocode}`);

    return {
      promotionId,
      code: `${prefix}${promocode}`,
      isUsed: false,
      promoLink: url.toString(),
    };
  });

  for (let i = 0; i < codeArray.length; i += chunkSize) {
    const chunk = codeArray.slice(i, i + chunkSize);
    await db.insert(promotionCodes).values(chunk);
  }

  return codeArray;
}
