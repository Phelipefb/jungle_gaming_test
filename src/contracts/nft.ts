import { z } from "zod";

import { paginationSchema } from "@/contracts/api";

export const moneyAmountSchema = z
  .string()
  .regex(/^\d+(\.\d{1,18})?$/, "Valor monetário inválido");

export const priceSchema = z.object({
  amount: moneyAmountSchema,
  currency: z.literal("ETH"),
});

export const creatorSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  avatarUrl: z.string().min(1),
  verified: z.boolean(),
});

export const nftImageSchema = z.object({
  id: z.string().min(1),
  url: z.string().min(1),
  alt: z.string().min(1),
});

const nftEditionBaseSchema = {
  id: z.string().min(1),
  name: z.string().min(1),
  maxPerOrder: z.number().int().positive(),
};

export const nftEditionSchema = z.discriminatedUnion("type", [
  z.object({
    ...nftEditionBaseSchema,
    type: z.literal("LIMITED"),
    available: z.number().int().nonnegative(),
    total: z.number().int().positive(),
  }),
  z.object({
    ...nftEditionBaseSchema,
    type: z.literal("OPEN"),
    available: z.null(),
    total: z.null(),
  }),
]);

export const nftAttributeSchema = z.object({
  traitType: z.string().min(1),
  value: z.string().min(1),
});

export const nftCollectionSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
});

export const nftNetworkSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
});

export const nftSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string(),
  imageUrl: z.string().min(1),
  gallery: z.array(nftImageSchema).min(1),
  category: z.string().min(1),
  collection: nftCollectionSchema,
  network: nftNetworkSchema,
  creator: creatorSchema,
  price: priceSchema,
  previousPrice: priceSchema.nullable(),
  editions: z.array(nftEditionSchema).min(1),
  attributes: z.array(nftAttributeSchema),
  featured: z.boolean(),
  version: z.number().int().nonnegative(),
});

export const nftListResponseSchema = z.object({
  items: z.array(nftSchema),
  pagination: paginationSchema,
});

export type MoneyAmount = z.infer<typeof moneyAmountSchema>;
export type Price = z.infer<typeof priceSchema>;
export type Creator = z.infer<typeof creatorSchema>;
export type NftImage = z.infer<typeof nftImageSchema>;
export type NftEdition = z.infer<typeof nftEditionSchema>;
export type NftAttribute = z.infer<typeof nftAttributeSchema>;
export type Nft = z.infer<typeof nftSchema>;
export type NftListResponse = z.infer<typeof nftListResponseSchema>;
export type NftCollection = z.infer<typeof nftCollectionSchema>;
export type NftNetwork = z.infer<typeof nftNetworkSchema>;
