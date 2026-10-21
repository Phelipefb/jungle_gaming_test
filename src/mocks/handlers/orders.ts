import { http, HttpResponse } from "msw";
import { emitOrderUpdated } from "@/mocks/realtime";
import { resolvePendingOrder } from "@/mocks/utils/resolve-pending-order";
import {
  apiErrorResponseSchema,
  checkoutRequestSchema,
  checkoutResponseSchema,
  orderListResponseSchema,
  orderResponseSchema,
  type ApiErrorCode,
} from "@/contracts";
import { writeMockDatabase } from "@/mocks/state/database";
import { buildPendingOrder } from "@/mocks/utils/build-pending-order";
import { buildQuote } from "@/mocks/utils/build-quote";
import {
  checkoutItemsMatchQuote,
  createCheckoutFingerprint,
} from "@/mocks/utils/checkout";
import { getAuthenticatedContext } from "@/mocks/utils/get-authenticated-context";
import { scheduleOrderResolution } from "@/mocks/utils/schedule-order-resolution";

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

function createOrderError(
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

export const orderHandlers = [
  http.post("/api/checkout", async ({ request }) => {
    const context = getAuthenticatedContext();

    if (!context.authenticated) {
      return createAuthenticationError(context.code, context.message);
    }

    const requestBody = await request.json().catch(() => null);
    const requestResult = checkoutRequestSchema.safeParse(requestBody);

    if (!requestResult.success) {
      return createOrderError(
        "VALIDATION_ERROR",
        "Verifique os dados do checkout.",
        400,
        requestResult.error.flatten().fieldErrors as Record<string, string[]>,
      );
    }

    const checkoutRequest = requestResult.data;
    const userId = context.account.user.id;
    const orders = context.database.ordersByUser[userId] ?? [];
    const idempotencyRecords =
      context.database.checkoutIdempotencyByUser[userId] ?? {};

    const requestFingerprint = createCheckoutFingerprint(checkoutRequest);

    const existingIdempotencyRecord =
      idempotencyRecords[checkoutRequest.idempotencyKey];

    if (existingIdempotencyRecord) {
      if (existingIdempotencyRecord.requestFingerprint !== requestFingerprint) {
        return createOrderError(
          "IDEMPOTENCY_CONFLICT",
          "A chave de idempotência já foi usada em outro checkout.",
          409,
        );
      }

      const existingOrder = orders.find(
        (order) => order.id === existingIdempotencyRecord.orderId,
      );

      if (!existingOrder) {
        return createOrderError(
          "CONFLICT",
          "O pedido idempotente não foi encontrado.",
          409,
        );
      }

      return HttpResponse.json(
        checkoutResponseSchema.parse({
          order: existingOrder,
        }),
      );
    }

    const quote = (context.database.quotesByUser[userId] ?? []).find(
      (item) => item.id === checkoutRequest.quoteId,
    );

    if (!quote) {
      return createOrderError("NOT_FOUND", "Cotação não encontrada.", 404);
    }

    if (new Date(quote.expiresAt).getTime() <= Date.now()) {
      return createOrderError(
        "CONFLICT",
        "A cotação expirou. Gere uma nova cotação.",
        409,
      );
    }

    if (quote.status === "UNAVAILABLE") {
      return createOrderError(
        "OUT_OF_STOCK",
        "A cotação possui itens indisponíveis.",
        409,
      );
    }

    if (quote.networkId !== checkoutRequest.networkId) {
      return createOrderError(
        "CONFLICT",
        "A rede do checkout é diferente da cotação.",
        409,
        {
          networkId: [`Selecione a rede da cotação: ${quote.networkId}.`],
        },
      );
    }

    if (!checkoutItemsMatchQuote(checkoutRequest, quote)) {
      return createOrderError(
        "CONFLICT",
        "Os itens do checkout são diferentes da cotação.",
        409,
      );
    }

    const normalizedCouponCode =
      checkoutRequest.couponCode?.toLocaleUpperCase("pt-BR") ?? null;

    const quotedCouponCode = quote.coupon?.code ?? null;

    if (normalizedCouponCode !== quotedCouponCode) {
      return createOrderError(
        "CONFLICT",
        "O cupom do checkout é diferente da cotação.",
        409,
      );
    }

    const wallet = (context.database.walletsByUser[userId] ?? []).find(
      (item) => item.id === checkoutRequest.paymentMethodId,
    );

    if (!wallet) {
      return createOrderError(
        "NOT_FOUND",
        "Carteira de pagamento não encontrada.",
        404,
      );
    }

    if (wallet.status !== "CONNECTED") {
      return createOrderError(
        "CONFLICT",
        "Conecte a carteira antes de confirmar a compra.",
        409,
      );
    }

    if (wallet.network.id !== checkoutRequest.networkId) {
      return createOrderError(
        "CONFLICT",
        "A carteira está conectada em outra rede.",
        409,
        {
          networkId: [`Selecione a rede ${wallet.network.name}.`],
        },
      );
    }

    const revalidationResult = buildQuote({
      items: quote.items.map((item) => ({
        nftId: item.nftId,
        editionId: item.editionId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        version: item.version,
      })),
      couponCode: quote.coupon?.code ?? null,
      networkId: quote.networkId,
      networkFee: quote.totals.networkFee,
    });

    if (!revalidationResult.success) {
      return createOrderError(
        revalidationResult.code,
        revalidationResult.message,
        revalidationResult.code === "NOT_FOUND" ? 404 : 400,
        revalidationResult.fieldErrors,
      );
    }

    if (revalidationResult.quote.status !== "VALID") {
      const existingQuotes = context.database.quotesByUser[userId] ?? [];

      context.database.quotesByUser[userId] = [
        ...existingQuotes.slice(-9),
        revalidationResult.quote,
      ];

      writeMockDatabase(context.database);

      if (revalidationResult.quote.status === "UNAVAILABLE") {
        return createOrderError(
          "OUT_OF_STOCK",
          "Um ou mais itens não estão mais disponíveis.",
          409,
        );
      }

      return createOrderError(
        "CONFLICT",
        "A cotação mudou. Revise os novos valores antes de continuar.",
        409,
      );
    }

    const checkoutOutcome = context.database.nextCheckoutOutcome;

    if (checkoutOutcome === "TRANSIENT_ERROR") {
      context.database.nextCheckoutOutcome = "CONFIRMED";
      writeMockDatabase(context.database);

      return createOrderError(
        "TRANSIENT_ERROR",
        "O serviço de pagamento está temporariamente indisponível.",
        503,
      );
    }

    const orderResult = buildPendingOrder(checkoutRequest, quote);

    if (!orderResult.success) {
      return createOrderError("CONFLICT", orderResult.message, 409);
    }

    context.database.ordersByUser[userId] = [...orders, orderResult.order];

    context.database.checkoutIdempotencyByUser[userId] = {
      ...idempotencyRecords,
      [checkoutRequest.idempotencyKey]: {
        requestFingerprint,
        orderId: orderResult.order.id,
      },
    };

    context.database.pendingOrderOutcomes[orderResult.order.id] =
      checkoutOutcome;

    context.database.nextCheckoutOutcome = "CONFIRMED";

    writeMockDatabase(context.database);

    scheduleOrderResolution(userId, orderResult.order.id);

    return HttpResponse.json(
      checkoutResponseSchema.parse({
        order: orderResult.order,
      }),
      { status: 202 },
    );
  }),

  http.get("/api/orders", () => {
    const context = getAuthenticatedContext();

    if (!context.authenticated) {
      return createAuthenticationError(context.code, context.message);
    }

    const userId = context.account.user.id;
    const orders = context.database.ordersByUser[userId] ?? [];

    return HttpResponse.json(
      orderListResponseSchema.parse({
        items: orders,
      }),
    );
  }),

  http.get("/api/orders/:orderId", ({ params }) => {
    const context = getAuthenticatedContext();

    if (!context.authenticated) {
      return createAuthenticationError(context.code, context.message);
    }

    const userId = context.account.user.id;
    const orderId = String(params.orderId);

    const order = (context.database.ordersByUser[userId] ?? []).find(
      (item) => item.id === orderId,
    );

    if (!order) {
      return createOrderError("NOT_FOUND", "Pedido não encontrado.", 404);
    }

    return HttpResponse.json(
      orderResponseSchema.parse({
        order,
      }),
    );
  }),

  http.post("/api/mock/orders/:orderId/resolve", ({ params }) => {
    const context = getAuthenticatedContext();

    if (!context.authenticated) {
      return createAuthenticationError(context.code, context.message);
    }

    const userId = context.account.user.id;
    const orderId = String(params.orderId);

    const existingOrder = (context.database.ordersByUser[userId] ?? []).find(
      (order) => order.id === orderId,
    );

    if (!existingOrder) {
      return createOrderError("NOT_FOUND", "Pedido não encontrado.", 404);
    }

    const wasPending = existingOrder.status === "PENDING";

    const result = resolvePendingOrder(context.database, userId, orderId);

    if (!result.success) {
      return createOrderError("CONFLICT", result.message, 409);
    }

    writeMockDatabase(context.database);

    if (wasPending) {
      emitOrderUpdated({
        orderId: result.order.id,
        status: result.order.status,
        version: result.order.version,
        updatedAt: result.order.updatedAt,
      });
    }

    return HttpResponse.json(
      orderResponseSchema.parse({
        order: result.order,
      }),
    );
  }),
];
