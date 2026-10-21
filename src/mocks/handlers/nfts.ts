import Decimal from "decimal.js";
import { http, HttpResponse } from "msw";
import { z } from "zod";
import {
  apiErrorResponseSchema,
  catalogSearchSchema,
  nftListResponseSchema,
  moneyAmountSchema,
  nftUpdatedPayloadSchema,
} from "@/contracts";
import { getCurrentNft, getCurrentNfts } from "@/mocks/utils/get-current-nfts";
import { emitNftUpdated } from "@/mocks/realtime";
import { readMockDatabase, writeMockDatabase } from "@/mocks/state/database";

const pageSize = 8;

const updateNftPriceRequestSchema = z.object({
  amount: moneyAmountSchema,
});

const updateNftAvailabilityRequestSchema = z.object({
  available: z.number().int().nonnegative(),
});

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
    let filteredNfts = getCurrentNfts();

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
    const nft = getCurrentNft(nftId);

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

  http.post("/api/mock/nfts/:nftId/price", async ({ params, request }) => {
    const requestBody = await request.json().catch(() => null);

    const requestResult = updateNftPriceRequestSchema.safeParse(requestBody);

    if (!requestResult.success) {
      return HttpResponse.json(
        apiErrorResponseSchema.parse({
          error: {
            code: "VALIDATION_ERROR",
            message: "Informe um preço válido.",
            fieldErrors: requestResult.error.flatten().fieldErrors,
          },
        }),
        { status: 400 },
      );
    }

    const nftId = String(params.nftId);
    const database = readMockDatabase();
    const nft = getCurrentNft(nftId, database);

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

    const update = nftUpdatedPayloadSchema.parse({
      nftId: nft.id,
      price: {
        amount: requestResult.data.amount,
        currency: "ETH",
      },
      editions: nft.editions,
      version: nft.version + 1,
    });

    database.nftOverridesById[nft.id] = update;

    writeMockDatabase(database);
    emitNftUpdated(update);

    return HttpResponse.json(update);
  }),

  http.post(
    "/api/mock/nfts/:nftId/editions/:editionId/availability",
    async ({ params, request }) => {
      const requestBody = await request.json().catch(() => null);

      const requestResult =
        updateNftAvailabilityRequestSchema.safeParse(requestBody);

      if (!requestResult.success) {
        return HttpResponse.json(
          apiErrorResponseSchema.parse({
            error: {
              code: "VALIDATION_ERROR",
              message: "Informe uma disponibilidade válida.",
              fieldErrors: requestResult.error.flatten().fieldErrors,
            },
          }),
          { status: 400 },
        );
      }

      const nftId = String(params.nftId);
      const editionId = String(params.editionId);
      const database = readMockDatabase();
      const nft = getCurrentNft(nftId, database);

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

      const edition = nft.editions.find((item) => item.id === editionId);

      if (!edition) {
        return HttpResponse.json(
          apiErrorResponseSchema.parse({
            error: {
              code: "NOT_FOUND",
              message: "Edição não encontrada.",
            },
          }),
          { status: 404 },
        );
      }

      if (edition.type === "OPEN") {
        return HttpResponse.json(
          apiErrorResponseSchema.parse({
            error: {
              code: "CONFLICT",
              message: "Edições abertas não possuem estoque limitado.",
            },
          }),
          { status: 409 },
        );
      }

      const updatedEditions = nft.editions.map((item) =>
        item.id === editionId
          ? {
              ...item,
              available: requestResult.data.available,
            }
          : item,
      );

      const update = nftUpdatedPayloadSchema.parse({
        nftId: nft.id,
        price: nft.price,
        editions: updatedEditions,
        version: nft.version + 1,
      });

      database.nftOverridesById[nft.id] = update;

      writeMockDatabase(database);
      emitNftUpdated(update);

      return HttpResponse.json(update);
    },
  ),
];
