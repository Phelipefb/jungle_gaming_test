import { z } from "zod";

import { nftEditionSchema, priceSchema } from "@/contracts/nft";
import { orderStatusSchema } from "@/contracts/order";

export const realtimeReadyPayloadSchema = z.object({
  version: z.number().int().positive(),
});

export const nftUpdatedPayloadSchema = z.object({
  nftId: z.string().min(1),
  price: priceSchema,
  edition: nftEditionSchema,
  version: z.number().int().nonnegative(),
});

export const orderUpdatedPayloadSchema = z.object({
  orderId: z.string().min(1),
  status: orderStatusSchema,
  version: z.number().int().nonnegative(),
  updatedAt: z.string().datetime({ offset: true }),
});

export type RealtimeReadyPayload = z.infer<typeof realtimeReadyPayloadSchema>;
export type NftUpdatedPayload = z.infer<typeof nftUpdatedPayloadSchema>;
export type OrderUpdatedPayload = z.infer<typeof orderUpdatedPayloadSchema>;
