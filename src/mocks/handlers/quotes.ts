import { http, HttpResponse } from "msw";

import {
  apiErrorResponseSchema,
  quoteRequestSchema,
  quoteResponseSchema,
  type ApiErrorCode,
} from "@/contracts";
import { walletNetworkFixtures } from "@/mocks/fixtures/wallets";
import { writeMockDatabase } from "@/mocks/state/database";
import { buildQuote } from "@/mocks/utils/build-quote";
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

function createQuoteError(
  code: ApiErrorCode,
  message: string,
  status: number,
  fieldErrors?: Record<string, string[]>,
) {
  return HttpResponse.json(
    apiErrorResponseSchema.parse({
      error: {
        code,
        message,
        fieldErrors,
      },
    }),
    { status },
  );
}

export const quoteHandlers = [
  http.post("/api/quotes", async ({ request }) => {
    const context = getAuthenticatedContext();

    if (!context.authenticated) {
      return createAuthenticationError(context.code, context.message);
    }

    const requestBody = await request.json().catch(() => null);
    const requestResult = quoteRequestSchema.safeParse(requestBody);

    if (!requestResult.success) {
      return createQuoteError(
        "VALIDATION_ERROR",
        "Verifique os dados da cotação.",
        400,
        requestResult.error.flatten().fieldErrors as Record<string, string[]>,
      );
    }

    const networkExists = walletNetworkFixtures.some(
      (network) => network.id === requestResult.data.networkId,
    );

    if (!networkExists) {
      return createQuoteError(
        "VALIDATION_ERROR",
        "A rede informada não está disponível.",
        400,
        {
          networkId: ["Selecione uma rede válida."],
        },
      );
    }

    const result = buildQuote(requestResult.data);

    if (!result.success) {
      return createQuoteError(
        result.code,
        result.message,
        result.code === "NOT_FOUND" ? 404 : 400,
        result.fieldErrors,
      );
    }

    const userId = context.account.user.id;
    const existingQuotes = context.database.quotesByUser[userId] ?? [];

    context.database.quotesByUser[userId] = [
      ...existingQuotes.slice(-9),
      result.quote,
    ];

    writeMockDatabase(context.database);

    return HttpResponse.json(
      quoteResponseSchema.parse({
        quote: result.quote,
      }),
      { status: 201 },
    );
  }),
];
