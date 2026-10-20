import { z } from "zod";

export const apiErrorCodeSchema = z.enum([
  "VALIDATION_ERROR",
  "UNAUTHENTICATED",
  "SESSION_EXPIRED",
  "FORBIDDEN",
  "NOT_FOUND",
  "CONFLICT",
  "OUT_OF_STOCK",
  "INVALID_COUPON",
  "EXPIRED_COUPON",
  "IDEMPOTENCY_CONFLICT",
  "PAYMENT_DECLINED",
  "TRANSIENT_ERROR",
]);

export const apiErrorSchema = z.object({
  code: apiErrorCodeSchema,
  message: z.string().min(1),
  fieldErrors: z.record(z.string(), z.array(z.string().min(1))).optional(),
  requestId: z.string().min(1).optional(),
});

export const apiErrorResponseSchema = z.object({
  error: apiErrorSchema,
});

export const paginationSchema = z.object({
  page: z.number().int().positive(),
  pageSize: z.number().int().positive(),
  totalItems: z.number().int().nonnegative(),
  totalPages: z.number().int().nonnegative(),
});

export type ApiErrorCode = z.infer<typeof apiErrorCodeSchema>;
export type ApiError = z.infer<typeof apiErrorSchema>;
export type ApiErrorResponse = z.infer<typeof apiErrorResponseSchema>;
export type Pagination = z.infer<typeof paginationSchema>;
