import { http, HttpResponse } from "msw";

import {
  apiErrorResponseSchema,
  favoriteListResponseSchema,
  favoriteResponseSchema,
} from "@/contracts";
import { nftFixtures } from "@/mocks/fixtures/nfts";
import { writeMockDatabase } from "@/mocks/state/database";
import { getAuthenticatedContext } from "@/mocks/utils/get-authenticated-context";

function createAuthenticationError(
  code: "UNAUTHENTICATED" | "SESSION_EXPIRED",
  message: string,
) {
  return HttpResponse.json(
    apiErrorResponseSchema.parse({
      error: {
        code,
        message,
      },
    }),
    { status: 401 },
  );
}

export const favoriteHandlers = [
  http.get("/api/favorites", () => {
    const context = getAuthenticatedContext();

    if (!context.authenticated) {
      return createAuthenticationError(context.code, context.message);
    }

    const userId = context.account.user.id;
    const favorites = context.database.favoritesByUser[userId] ?? [];

    return HttpResponse.json(
      favoriteListResponseSchema.parse({
        items: favorites,
      }),
    );
  }),

  http.post("/api/favorites/:nftId", ({ params }) => {
    const context = getAuthenticatedContext();

    if (!context.authenticated) {
      return createAuthenticationError(context.code, context.message);
    }

    const nftId = String(params.nftId);
    const nftExists = nftFixtures.some((nft) => nft.id === nftId);

    if (!nftExists) {
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

    const userId = context.account.user.id;
    const favorites = context.database.favoritesByUser[userId] ?? [];

    const existingFavorite = favorites.find(
      (favorite) => favorite.nftId === nftId,
    );

    if (existingFavorite) {
      return HttpResponse.json(
        favoriteResponseSchema.parse({
          favorite: existingFavorite,
        }),
      );
    }

    const favorite = {
      nftId,
      createdAt: new Date().toISOString(),
    };

    context.database.favoritesByUser[userId] = [...favorites, favorite];

    writeMockDatabase(context.database);

    return HttpResponse.json(favoriteResponseSchema.parse({ favorite }), {
      status: 201,
    });
  }),

  http.delete("/api/favorites/:nftId", ({ params }) => {
    const context = getAuthenticatedContext();

    if (!context.authenticated) {
      return createAuthenticationError(context.code, context.message);
    }

    const nftId = String(params.nftId);
    const userId = context.account.user.id;
    const favorites = context.database.favoritesByUser[userId] ?? [];

    context.database.favoritesByUser[userId] = favorites.filter(
      (favorite) => favorite.nftId !== nftId,
    );

    writeMockDatabase(context.database);

    return new HttpResponse(null, { status: 204 });
  }),
];
