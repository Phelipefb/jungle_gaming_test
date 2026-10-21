import { z } from "zod";

export const mockCartItemSchema = z.object({
  nftId: z.string().min(1),
  editionId: z.string().min(1),
  quantity: z.number().int().positive(),
});

export const mockCartSchema = z.object({
  items: z.array(mockCartItemSchema),
  couponCode: z.string().min(1).nullable(),
  updatedAt: z.string().datetime({ offset: true }),
});

export type MockCartItem = z.infer<typeof mockCartItemSchema>;
export type MockCart = z.infer<typeof mockCartSchema>;

export function createEmptyMockCart(): MockCart {
  return {
    items: [],
    couponCode: null,
    updatedAt: new Date(0).toISOString(),
  };
}
