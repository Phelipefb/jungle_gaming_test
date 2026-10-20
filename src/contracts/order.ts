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
  networkId: z.string().min(1),
  quoteId: z.string().min(1),
  idempotencyKey: z.string().min(1),
});

export const orderStatusSchema = z.enum(["PENDING", "CONFIRMED", "DECLINED"]);

export const orderItemSchema = z.object({
  nftId: z.string().min(1),
  name: z.string().min(1),
  imageUrl: z.string().min(1),
  unitPrice: priceSchema,
  quantity: z.number().int().positive(),
});

export const orderTransactionSchema = z.object({
  hash: z.string().min(1),
  explorerUrl: z.string().min(1),
});

const orderBaseSchema = z.object({
  id: z.string().min(1),
  quoteId: z.string().min(1),
  items: z.array(orderItemSchema).min(1),
  coupon: appliedCouponSchema.nullable(),
  totals: cartTotalsSchema,
  paymentMethodId: z.string().min(1),
  networkId: z.string().min(1),
  version: z.number().int().nonnegative(),
  createdAt: z.string().datetime({ offset: true }),
  updatedAt: z.string().datetime({ offset: true }),
});

export const pendingOrderSchema = orderBaseSchema.extend({
  status: z.literal("PENDING"),
  transaction: z.null(),
});

export const confirmedOrderSchema = orderBaseSchema.extend({
  status: z.literal("CONFIRMED"),
  transaction: orderTransactionSchema,
});

export const declinedOrderSchema = orderBaseSchema.extend({
  status: z.literal("DECLINED"),
  transaction: z.null(),
  failureReason: z.string().min(1),
});

export const orderSchema = z.discriminatedUnion("status", [
  pendingOrderSchema,
  confirmedOrderSchema,
  declinedOrderSchema,
]);

export const checkoutResponseSchema = z.object({
  order: orderSchema,
});

export type CheckoutItem = z.infer<typeof checkoutItemSchema>;
export type CheckoutRequest = z.infer<typeof checkoutRequestSchema>;
export type OrderStatus = z.infer<typeof orderStatusSchema>;
export type OrderItem = z.infer<typeof orderItemSchema>;
export type OrderTransaction = z.infer<typeof orderTransactionSchema>;
export type Order = z.infer<typeof orderSchema>;
export type CheckoutResponse = z.infer<typeof checkoutResponseSchema>;
