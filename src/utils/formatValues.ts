type RawOrderPayload = any;

type FormattedOrderPayload = {
  order: any[];
  name: string;
  number: string;
  deliveryType: "pickup" | "delivery";
  location: string | null;
  note: string | null;
  deliveryFee: number;
  foodCost: number;
  totalPrice: number;
  promoId: number | null;
};

function toNumber(value: any): number {
  const num = Number(value);
  return isNaN(num) ? 0 : num;
}

function parseJSON(value: any, fallback: any) {
  try {
    if (typeof value === "string") {
      return JSON.parse(value);
    }
    return value ?? fallback;
  } catch {
    return fallback;
  }
}

export function formatOrderPayload(
  body: RawOrderPayload,
): FormattedOrderPayload {
  return {
    order: parseJSON(body.order, []),
    name: String(body.name || "").trim(),
    number: String(body.number || "").trim(),
    deliveryType: body.deliveryType === "pickup" ? "pickup" : "delivery",
    location: body.location ? String(body.location) : null,
    note: body.note ? String(body.note) : null,
    deliveryFee: toNumber(body.deliveryFee),
    foodCost: toNumber(body.foodCost),
    totalPrice: toNumber(body.totalPrice),
    promoId: body.promoId != null ? Number(body.promoId) : null,
  };
}
