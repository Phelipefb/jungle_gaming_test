import { z } from "zod";

export const favoriteSchema = z.object({
  nftId: z.string().min(1),
  createdAt: z.string().datetime({ offset: true }),
});

export const favoriteListResponseSchema = z.object({
  items: z.array(favoriteSchema),
});

export const favoriteResponseSchema = z.object({
  favorite: favoriteSchema,
});

export type Favorite = z.infer<typeof favoriteSchema>;
export type FavoriteListResponse = z.infer<typeof favoriteListResponseSchema>;
export type FavoriteResponse = z.infer<typeof favoriteResponseSchema>;
