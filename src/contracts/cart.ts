import { z } from "zod";

import { moneyAmountSchema, nftSchema } from "@/contracts/nft";

export const cartItemSchema = z.object({
  nft: nftSchema,
  editionId: z.string().min(1),
  quantity: z.number().int().positive(),
});

export const appliedCouponSchema = z.object({
  code: z.string().min(1),
  discountAmount: moneyAmountSchema,
});

export const cartTotalsSchema = z.object({
  subtotal: moneyAmountSchema,
  discount: moneyAmountSchema,
  networkFee: moneyAmountSchema,
  total: moneyAmountSchema,
  currency: z.literal("ETH"),
});

export const cartSchema = z.object({
  items: z.array(cartItemSchema),
  coupon: appliedCouponSchema.nullable(),
  totals: cartTotalsSchema,
  updatedAt: z.string().datetime({ offset: true }),
});

export const addCartItemRequestSchema = z.object({
  nftId: z.string().min(1),
  editionId: z.string().min(1),
  quantity: z.number().int().positive(),
});
export const updateCartItemRequestSchema = z.object({
  nftId: z.string().min(1),
  editionId: z.string().min(1),
  quantity: z.number().int().positive(),
});
export const applyCouponRequestSchema = z.object({
  code: z.string().trim().min(1, "Informe o código do cupom"),
});

export type CartItem = z.infer<typeof cartItemSchema>;
export type AppliedCoupon = z.infer<typeof appliedCouponSchema>;
export type CartTotals = z.infer<typeof cartTotalsSchema>;
export type Cart = z.infer<typeof cartSchema>;
export type AddCartItemRequest = z.infer<typeof addCartItemRequestSchema>;
export type UpdateCartItemRequest = z.infer<typeof updateCartItemRequestSchema>;
export type ApplyCouponRequest = z.infer<typeof applyCouponRequestSchema>;
