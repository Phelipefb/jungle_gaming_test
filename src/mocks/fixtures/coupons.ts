import { z } from "zod";

export const mockCouponSchema = z.object({
  code: z.string().min(1),
  discountPercentage: z.number().positive().max(100),
  expiresAt: z.string().datetime({ offset: true }),
});

export const couponFixtures = mockCouponSchema.array().parse([
  {
    code: "KURIO10",
    discountPercentage: 10,
    expiresAt: "2099-12-31T23:59:59.000Z",
  },
  {
    code: "EXPIRADO10",
    discountPercentage: 10,
    expiresAt: "2020-01-01T00:00:00.000Z",
  },
]);

export type MockCoupon = z.infer<typeof mockCouponSchema>;
