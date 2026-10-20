import { z } from "zod";

import { appliedCouponSchema, cartTotalsSchema } from "@/contracts/cart";
import { priceSchema } from "@/contracts/nft";

export const checkoutItemSchema = z.object({
  nftId: z.string().min(1),
  quantity: z.number().int().positive(),
});

export const checkoutRequestSchema = z.object({
  items: z.array(checkoutItemSchema).min(1),
  couponCode: z.string().min(1).nullable(),
  paymentMethodId: z.string().min(1),
  idempotencyKey: z.string().min(1),
});

export const orderStatusSchema = z.enum([
  "PENDING",
  "CONFIRMED",
  "FAILED",
  "CANCELLED",
]);

export const orderItemSchema = z.object({
  nftId: z.string().min(1),
  name: z.string().min(1),
  imageUrl: z.string().min(1),
  unitPrice: priceSchema,
  quantity: z.number().int().positive(),
});

export const orderSchema = z.object({
  id: z.string().min(1),
  status: orderStatusSchema,
  items: z.array(orderItemSchema).min(1),
  coupon: appliedCouponSchema.nullable(),
  totals: cartTotalsSchema,
  paymentMethodId: z.string().min(1),
  createdAt: z.string().datetime({ offset: true }),
});

export const checkoutResponseSchema = z.object({
  order: orderSchema,
});

export type CheckoutItem = z.infer<typeof checkoutItemSchema>;
export type CheckoutRequest = z.infer<typeof checkoutRequestSchema>;
export type OrderStatus = z.infer<typeof orderStatusSchema>;
export type OrderItem = z.infer<typeof orderItemSchema>;
export type Order = z.infer<typeof orderSchema>;
export type CheckoutResponse = z.infer<typeof checkoutResponseSchema>;
