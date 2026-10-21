import {
  catalogSearchSchema,
  nftListResponseSchema,
  nftSchema,
  type CatalogSearch,
  type Nft,
  type NftListResponse,
} from "@/contracts";
import { httpClient } from "@/lib/http-client";

export async function getNfts(
  search: Partial<CatalogSearch> = {},
): Promise<NftListResponse> {
  const validatedSearch = catalogSearchSchema.parse(search);

  const response = await httpClient.get("/nfts", {
    params: validatedSearch,
  });

  return nftListResponseSchema.parse(response.data);
}

export async function getNft(nftId: string): Promise<Nft> {
  const response = await httpClient.get(`/nfts/${nftId}`);

  return nftSchema.parse(response.data);
}
