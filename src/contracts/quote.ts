import { z } from "zod";

import { appliedCouponSchema, cartTotalsSchema } from "@/contracts/cart";
import { priceSchema } from "@/contracts/nft";

export const quoteRequestItemSchema = z.object({
  nftId: z.string().min(1),
  editionId: z.string().min(1),
  quantity: z.number().int().positive(),
});

export const quoteRequestSchema = z.object({
  items: z.array(quoteRequestItemSchema).min(1),
  couponCode: z.string().min(1).nullable(),
  networkId: z.string().min(1),
});

export const quoteStatusSchema = z.enum(["VALID", "CHANGED", "UNAVAILABLE"]);

export const quoteItemSchema = z.object({
  nftId: z.string().min(1),
  editionId: z.string().min(1),
  quantity: z.number().int().positive(),
  available: z.number().int().nonnegative(),
  unitPrice: priceSchema,
  version: z.number().int().nonnegative(),
});

export const quoteChangeTypeSchema = z.enum([
  "PRICE_CHANGED",
  "AVAILABILITY_CHANGED",
  "COUPON_CHANGED",
  "NETWORK_FEE_CHANGED",
]);

export const quoteChangeSchema = z.object({
  type: quoteChangeTypeSchema,
  nftId: z.string().min(1).nullable(),
  message: z.string().min(1),
});

export const quoteSchema = z.object({
  id: z.string().min(1),
  status: quoteStatusSchema,
  items: z.array(quoteItemSchema).min(1),
  coupon: appliedCouponSchema.nullable(),
  totals: cartTotalsSchema,
  changes: z.array(quoteChangeSchema),
  expiresAt: z.string().datetime({ offset: true }),
});

export const quoteResponseSchema = z.object({
  quote: quoteSchema,
});

export type QuoteRequestItem = z.infer<typeof quoteRequestItemSchema>;
export type QuoteRequest = z.infer<typeof quoteRequestSchema>;
export type QuoteStatus = z.infer<typeof quoteStatusSchema>;
export type QuoteItem = z.infer<typeof quoteItemSchema>;
export type QuoteChangeType = z.infer<typeof quoteChangeTypeSchema>;
export type QuoteChange = z.infer<typeof quoteChangeSchema>;
export type Quote = z.infer<typeof quoteSchema>;
export type QuoteResponse = z.infer<typeof quoteResponseSchema>;
