import { queryOptions } from "@tanstack/react-query";

import { catalogSearchSchema, type CatalogSearch } from "@/contracts";
import { getNft, getNfts } from "@/api/catalog";

export const nftQueryKeys = {
  all: ["nfts"] as const,

  lists: () => [...nftQueryKeys.all, "list"] as const,

  list: (search: CatalogSearch) => [...nftQueryKeys.lists(), search] as const,

  details: () => [...nftQueryKeys.all, "detail"] as const,

  detail: (nftId: string) => [...nftQueryKeys.details(), nftId] as const,
};

export function nftListQueryOptions(search: Partial<CatalogSearch> = {}) {
  const validatedSearch = catalogSearchSchema.parse(search);

  return queryOptions({
    queryKey: nftQueryKeys.list(validatedSearch),
    queryFn: () => getNfts(validatedSearch),
  });
}

export function nftDetailQueryOptions(nftId: string) {
  return queryOptions({
    queryKey: nftQueryKeys.detail(nftId),
    queryFn: () => getNft(nftId),
  });
}
