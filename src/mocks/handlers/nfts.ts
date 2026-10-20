import Decimal from "decimal.js";
import { http, HttpResponse } from "msw";

import {
  apiErrorResponseSchema,
  catalogSearchSchema,
  nftListResponseSchema,
} from "@/contracts";
import { nftFixtures } from "@/mocks/fixtures/nfts";

const pageSize = 8;

function normalizeText(value: string) {
  return value.toLocaleLowerCase("pt-BR");
}

export const nftHandlers = [
  http.get("/api/nfts", ({ request }) => {
    const url = new URL(request.url);

    const searchResult = catalogSearchSchema.safeParse(
      Object.fromEntries(url.searchParams),
    );

    if (!searchResult.success) {
      return HttpResponse.json(
        apiErrorResponseSchema.parse({
          error: {
            code: "VALIDATION_ERROR",
            message: "Os parâmetros do catálogo são inválidos.",
          },
        }),
        { status: 400 },
      );
    }

    const search = searchResult.data;
    let filteredNfts = [...nftFixtures];

    if (search.search) {
      const term = normalizeText(search.search);

      filteredNfts = filteredNfts.filter((nft) =>
        [nft.name, nft.creator.name, nft.collection.name].some((value) =>
          normalizeText(value).includes(term),
        ),
      );
    }

    if (search.category) {
      filteredNfts = filteredNfts.filter(
        (nft) => nft.category === search.category,
      );
    }

    if (search.collection) {
      filteredNfts = filteredNfts.filter(
        (nft) => nft.collection.id === search.collection,
      );
    }

    if (search.network) {
      filteredNfts = filteredNfts.filter(
        (nft) => nft.network.id === search.network,
      );
    }

    const minPrice = search.minPrice;

    if (minPrice !== undefined) {
      filteredNfts = filteredNfts.filter((nft) =>
        new Decimal(nft.price.amount).greaterThanOrEqualTo(minPrice),
      );
    }

    const maxPrice = search.maxPrice;

    if (maxPrice !== undefined) {
      filteredNfts = filteredNfts.filter((nft) =>
        new Decimal(nft.price.amount).lessThanOrEqualTo(maxPrice),
      );
    }

    switch (search.sort) {
      case "newest":
        filteredNfts.reverse();
        break;

      case "price-asc":
        filteredNfts.sort((first, second) =>
          new Decimal(first.price.amount).comparedTo(second.price.amount),
        );
        break;

      case "price-desc":
        filteredNfts.sort((first, second) =>
          new Decimal(second.price.amount).comparedTo(first.price.amount),
        );
        break;

      case "featured":
        filteredNfts.sort(
          (first, second) => Number(second.featured) - Number(first.featured),
        );
        break;
    }

    const totalItems = filteredNfts.length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const startIndex = (search.page - 1) * pageSize;
    const items = filteredNfts.slice(startIndex, startIndex + pageSize);

    return HttpResponse.json(
      nftListResponseSchema.parse({
        items,
        pagination: {
          page: search.page,
          pageSize,
          totalItems,
          totalPages,
        },
      }),
    );
  }),

  http.get("/api/nfts/:nftId", ({ params }) => {
    const nftId = String(params.nftId);
    const nft = nftFixtures.find((item) => item.id === nftId);

    if (!nft) {
      return HttpResponse.json(
        apiErrorResponseSchema.parse({
          error: {
            code: "NOT_FOUND",
            message: "NFT não encontrado.",
          },
        }),
        { status: 404 },
      );
    }

    return HttpResponse.json(nft);
  }),
];
