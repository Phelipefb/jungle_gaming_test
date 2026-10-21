import Decimal from "decimal.js";
import { z } from "zod";

import { moneyAmountSchema } from "@/contracts/nft";

const optionalTextSearchParamSchema = z.preprocess((value) => {
  if (typeof value !== "string") {
    return undefined;
  }

  const normalizedValue = value.trim();

  return normalizedValue.length > 0 ? normalizedValue : undefined;
}, z.string().optional());

const optionalMoneySearchParamSchema = z.preprocess(
  (value) => (value === "" ? undefined : value),
  moneyAmountSchema.optional(),
);

export const catalogViewSchema = z.enum(["all", "new", "trending"]);

export const catalogSortSchema = z.enum([
  "featured",
  "newest",
  "price-asc",
  "price-desc",
]);

export const catalogSearchSchema = z
  .object({
    view: catalogViewSchema.default("all").catch("all"),
    search: optionalTextSearchParamSchema,
    category: optionalTextSearchParamSchema,
    collection: optionalTextSearchParamSchema,
    network: optionalTextSearchParamSchema,
    minPrice: optionalMoneySearchParamSchema,
    maxPrice: optionalMoneySearchParamSchema,
    sort: catalogSortSchema.default("newest").catch("newest"),
    page: z.coerce.number().int().positive().default(1).catch(1),
  })
  .superRefine((search, context) => {
    if (
      search.minPrice !== undefined &&
      search.maxPrice !== undefined &&
      new Decimal(search.minPrice).greaterThan(search.maxPrice)
    ) {
      context.addIssue({
        code: "custom",
        path: ["maxPrice"],
        message: "O preço máximo deve ser maior ou igual ao mínimo",
      });
    }
  });

export type CatalogSort = z.infer<typeof catalogSortSchema>;
export type CatalogSearch = z.infer<typeof catalogSearchSchema>;
export type CatalogView = z.infer<typeof catalogViewSchema>;
