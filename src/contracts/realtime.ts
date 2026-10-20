import { z } from "zod";

import { priceSchema } from "@/contracts/nft";
import { orderStatusSchema } from "@/contracts/order";

export const realtimeReadyPayloadSchema = z.object({
  version: z.number().int().positive(),
});

export const nftAvailabilityUpdatedPayloadSchema = z.object({
  nftId: z.string().min(1),
  available: z.number().int().nonnegative(),
  version: z.number().int().nonnegative(),
});

export const nftPriceUpdatedPayloadSchema = z.object({
  nftId: z.string().min(1),
  price: priceSchema,
  version: z.number().int().nonnegative(),
});

export const orderStatusUpdatedPayloadSchema = z.object({
  orderId: z.string().min(1),
  status: orderStatusSchema,
  updatedAt: z.string().datetime({ offset: true }),
});

export type RealtimeReadyPayload = z.infer<typeof realtimeReadyPayloadSchema>;
export type NftAvailabilityUpdatedPayload = z.infer<
  typeof nftAvailabilityUpdatedPayloadSchema
>;
export type NftPriceUpdatedPayload = z.infer<
  typeof nftPriceUpdatedPayloadSchema
>;
export type OrderStatusUpdatedPayload = z.infer<
  typeof orderStatusUpdatedPayloadSchema
>;
