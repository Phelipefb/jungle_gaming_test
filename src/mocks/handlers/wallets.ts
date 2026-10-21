import { http, HttpResponse } from "msw";

import {
  apiErrorResponseSchema,
  createWalletRequestSchema,
  walletListResponseSchema,
  walletSchema,
  updateWalletRequestSchema,
  connectWalletRequestSchema,
  connectWalletResponseSchema,
  type ApiErrorCode,
} from "@/contracts";
import { walletNetworkFixtures } from "@/mocks/fixtures/wallets";
import { getAuthenticatedContext } from "@/mocks/utils/get-authenticated-context";
import { writeMockDatabase } from "@/mocks/state/database";

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

function createWalletError(
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

export const walletHandlers = [
  http.get("/api/wallets", () => {
    const context = getAuthenticatedContext();

    if (!context.authenticated) {
      return createAuthenticationError(context.code, context.message);
    }

    const userId = context.account.user.id;
    const wallets = context.database.walletsByUser[userId] ?? [];

    return HttpResponse.json(
      walletListResponseSchema.parse({
        items: wallets,
        networks: walletNetworkFixtures,
      }),
    );
  }),

  http.post("/api/wallets", async ({ request }) => {
    const context = getAuthenticatedContext();

    if (!context.authenticated) {
      return createAuthenticationError(context.code, context.message);
    }

    const requestBody = await request.json().catch(() => null);
    const requestResult = createWalletRequestSchema.safeParse(requestBody);

    if (!requestResult.success) {
      return createWalletError(
        "VALIDATION_ERROR",
        "Verifique os dados da carteira.",
        400,
        requestResult.error.flatten().fieldErrors as Record<string, string[]>,
      );
    }

    const network = walletNetworkFixtures.find(
      (item) => item.id === requestResult.data.networkId,
    );

    if (!network) {
      return createWalletError(
        "VALIDATION_ERROR",
        "A rede informada não está disponível.",
        400,
        {
          networkId: ["Selecione uma rede válida."],
        },
      );
    }

    const userId = context.account.user.id;
    const wallets = context.database.walletsByUser[userId] ?? [];
    const shouldBePrimary = requestResult.data.primary || wallets.length === 0;

    if (shouldBePrimary) {
      wallets.forEach((wallet) => {
        wallet.primary = false;
      });
    }

    const now = new Date().toISOString();

    const wallet = walletSchema.parse({
      id: `wallet-${crypto.randomUUID()}`,
      displayName: requestResult.data.displayName,
      profileName: requestResult.data.profileName,
      email: requestResult.data.email,
      address: requestResult.data.address,
      ensName: requestResult.data.ensName,
      referralCode: requestResult.data.referralCode,
      provider: requestResult.data.provider,
      network,
      status: "DISCONNECTED",
      primary: shouldBePrimary,
      createdAt: now,
      updatedAt: now,
    });

    context.database.walletsByUser[userId] = [...wallets, wallet];

    writeMockDatabase(context.database);

    return HttpResponse.json(wallet, {
      status: 201,
    });
  }),

  http.patch("/api/wallets/:walletId", async ({ params, request }) => {
    const context = getAuthenticatedContext();

    if (!context.authenticated) {
      return createAuthenticationError(context.code, context.message);
    }

    const requestBody = await request.json().catch(() => null);
    const requestResult = updateWalletRequestSchema.safeParse(requestBody);

    if (!requestResult.success) {
      return createWalletError(
        "VALIDATION_ERROR",
        "Verifique os dados da carteira.",
        400,
        requestResult.error.flatten().fieldErrors as Record<string, string[]>,
      );
    }

    const network = walletNetworkFixtures.find(
      (item) => item.id === requestResult.data.networkId,
    );

    if (!network) {
      return createWalletError(
        "VALIDATION_ERROR",
        "A rede informada não está disponível.",
        400,
        {
          networkId: ["Selecione uma rede válida."],
        },
      );
    }

    const userId = context.account.user.id;
    const walletId = String(params.walletId);
    const wallets = context.database.walletsByUser[userId] ?? [];

    const existingWallet = wallets.find((wallet) => wallet.id === walletId);

    if (!existingWallet) {
      return createWalletError("NOT_FOUND", "Carteira não encontrada.", 404);
    }

    if (existingWallet.primary && !requestResult.data.primary) {
      return createWalletError(
        "VALIDATION_ERROR",
        "Defina outra carteira como principal antes de alterar esta.",
        400,
        {
          primary: ["A conta precisa manter uma carteira principal."],
        },
      );
    }

    const now = new Date().toISOString();

    const updatedWallet = walletSchema.parse({
      ...existingWallet,
      displayName: requestResult.data.displayName,
      profileName: requestResult.data.profileName,
      email: requestResult.data.email,
      address: requestResult.data.address,
      ensName: requestResult.data.ensName,
      referralCode: requestResult.data.referralCode,
      provider: requestResult.data.provider,
      network,
      primary: requestResult.data.primary,
      updatedAt: now,
    });

    context.database.walletsByUser[userId] = wallets.map((wallet) => {
      if (wallet.id === walletId) {
        return updatedWallet;
      }

      if (updatedWallet.primary && wallet.primary) {
        return {
          ...wallet,
          primary: false,
          updatedAt: now,
        };
      }

      return wallet;
    });

    writeMockDatabase(context.database);

    return HttpResponse.json(updatedWallet);
  }),

  http.post("/api/wallets/connect", async ({ request }) => {
    const context = getAuthenticatedContext();

    if (!context.authenticated) {
      return createAuthenticationError(context.code, context.message);
    }

    const requestBody = await request.json().catch(() => null);
    const requestResult = connectWalletRequestSchema.safeParse(requestBody);

    if (!requestResult.success) {
      return createWalletError(
        "VALIDATION_ERROR",
        "Verifique os dados da conexão.",
        400,
        requestResult.error.flatten().fieldErrors as Record<string, string[]>,
      );
    }

    const { walletId, networkId } = requestResult.data;
    const networkExists = walletNetworkFixtures.some(
      (network) => network.id === networkId,
    );

    if (!networkExists) {
      return createWalletError(
        "VALIDATION_ERROR",
        "A rede informada não está disponível.",
        400,
        {
          networkId: ["Selecione uma rede válida."],
        },
      );
    }

    const userId = context.account.user.id;
    const wallets = context.database.walletsByUser[userId] ?? [];
    const wallet = wallets.find((item) => item.id === walletId);

    if (!wallet) {
      return createWalletError("NOT_FOUND", "Carteira não encontrada.", 404);
    }

    if (wallet.network.id !== networkId) {
      return createWalletError(
        "CONFLICT",
        "A carteira não pertence à rede selecionada.",
        409,
        {
          networkId: [`Selecione a rede ${wallet.network.name}.`],
        },
      );
    }

    if (context.database.nextWalletConnectionOutcome === "REFUSED") {
      context.database.nextWalletConnectionOutcome = "SUCCESS";
      writeMockDatabase(context.database);

      return createWalletError(
        "FORBIDDEN",
        "A conexão foi recusada na carteira.",
        403,
      );
    }

    const now = new Date().toISOString();

    context.database.walletsByUser[userId] = wallets.map((item) => ({
      ...item,
      status: item.id === walletId ? "CONNECTED" : "DISCONNECTED",
      updatedAt:
        item.id === walletId || item.status === "CONNECTED"
          ? now
          : item.updatedAt,
    }));

    const connectedWallet = context.database.walletsByUser[userId].find(
      (item) => item.id === walletId,
    );

    writeMockDatabase(context.database);

    return HttpResponse.json(
      connectWalletResponseSchema.parse({
        wallet: connectedWallet,
      }),
    );
  }),

  http.post("/api/wallets/:walletId/disconnect", ({ params }) => {
    const context = getAuthenticatedContext();

    if (!context.authenticated) {
      return createAuthenticationError(context.code, context.message);
    }

    const userId = context.account.user.id;
    const walletId = String(params.walletId);
    const wallets = context.database.walletsByUser[userId] ?? [];

    const wallet = wallets.find((item) => item.id === walletId);

    if (!wallet) {
      return createWalletError("NOT_FOUND", "Carteira não encontrada.", 404);
    }

    const now = new Date().toISOString();

    context.database.walletsByUser[userId] = wallets.map((item) => {
      if (item.id !== walletId || item.status === "DISCONNECTED") {
        return item;
      }

      return {
        ...item,
        status: "DISCONNECTED",
        updatedAt: now,
      };
    });

    const disconnectedWallet = context.database.walletsByUser[userId].find(
      (item) => item.id === walletId,
    );

    writeMockDatabase(context.database);

    return HttpResponse.json(
      connectWalletResponseSchema.parse({
        wallet: disconnectedWallet,
      }),
    );
  }),
];
