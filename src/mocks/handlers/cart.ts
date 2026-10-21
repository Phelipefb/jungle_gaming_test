import { http, HttpResponse } from "msw";
import { couponFixtures } from "@/mocks/fixtures/coupons";

import {
  addCartItemRequestSchema,
  apiErrorResponseSchema,
  updateCartItemRequestSchema,
  applyCouponRequestSchema,
  type ApiErrorCode,
} from "@/contracts";
import { getCurrentNft } from "@/mocks/utils/get-current-nfts";
import { writeMockDatabase } from "@/mocks/state/database";
import { buildCartResponse } from "@/mocks/utils/build-cart-response";
import { getCartContext } from "@/mocks/utils/get-cart-context";

function createCartError(
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

export const cartHandlers = [
  http.get("/api/cart", () => {
    const { cart } = getCartContext();

    return HttpResponse.json(buildCartResponse(cart));
  }),

  http.post("/api/cart/items", async ({ request }) => {
    const requestBody = await request.json().catch(() => null);

    const requestResult = addCartItemRequestSchema.safeParse(requestBody);

    if (!requestResult.success) {
      return createCartError(
        "VALIDATION_ERROR",
        "Verifique os dados do item.",
        400,
        requestResult.error.flatten().fieldErrors as Record<string, string[]>,
      );
    }

    const { nftId, editionId, quantity } = requestResult.data;

    const nft = getCurrentNft(nftId);

    if (!nft) {
      return createCartError("NOT_FOUND", "NFT não encontrado.", 404);
    }

    const edition = nft.editions.find((item) => item.id === editionId);

    if (!edition) {
      return createCartError("NOT_FOUND", "Edição não encontrada.", 404);
    }

    const context = getCartContext();
    const existingItem = context.cart.items.find(
      (item) => item.nftId === nftId && item.editionId === editionId,
    );

    const nextQuantity = (existingItem?.quantity ?? 0) + quantity;

    if (nextQuantity > edition.maxPerOrder) {
      return createCartError(
        "VALIDATION_ERROR",
        `O limite desta edição é ${edition.maxPerOrder} por pedido.`,
        400,
        {
          quantity: [`Escolha no máximo ${edition.maxPerOrder}.`],
        },
      );
    }

    if (edition.type === "LIMITED" && nextQuantity > edition.available) {
      return createCartError(
        "OUT_OF_STOCK",
        "A quantidade solicitada não está disponível.",
        409,
        {
          quantity: [
            `Há somente ${edition.available} unidade(s) disponível(is).`,
          ],
        },
      );
    }

    if (existingItem) {
      existingItem.quantity = nextQuantity;
    } else {
      context.cart.items.push({
        nftId,
        editionId,
        quantity,
      });
    }

    context.cart.updatedAt = new Date().toISOString();
    writeMockDatabase(context.database);

    return HttpResponse.json(buildCartResponse(context.cart), {
      status: existingItem ? 200 : 201,
    });
  }),

  http.patch("/api/cart/items", async ({ request }) => {
    const requestBody = await request.json().catch(() => null);

    const requestResult = updateCartItemRequestSchema.safeParse(requestBody);

    if (!requestResult.success) {
      return createCartError(
        "VALIDATION_ERROR",
        "Verifique os dados do item.",
        400,
        requestResult.error.flatten().fieldErrors as Record<string, string[]>,
      );
    }

    const { nftId, editionId, quantity } = requestResult.data;

    const nft = getCurrentNft(nftId);

    const edition = nft?.editions.find((item) => item.id === editionId);

    if (!nft || !edition) {
      return createCartError(
        "NOT_FOUND",
        "Item ou edição não encontrado.",
        404,
      );
    }

    const context = getCartContext();
    const existingItem = context.cart.items.find(
      (item) => item.nftId === nftId && item.editionId === editionId,
    );

    if (!existingItem) {
      return createCartError("NOT_FOUND", "O item não está no carrinho.", 404);
    }

    if (quantity > edition.maxPerOrder) {
      return createCartError(
        "VALIDATION_ERROR",
        `O limite desta edição é ${edition.maxPerOrder} por pedido.`,
        400,
        {
          quantity: [`Escolha no máximo ${edition.maxPerOrder}.`],
        },
      );
    }

    if (edition.type === "LIMITED" && quantity > edition.available) {
      return createCartError(
        "OUT_OF_STOCK",
        "A quantidade solicitada não está disponível.",
        409,
        {
          quantity: [
            `Há somente ${edition.available} unidade(s) disponível(is).`,
          ],
        },
      );
    }

    existingItem.quantity = quantity;
    context.cart.updatedAt = new Date().toISOString();
    writeMockDatabase(context.database);

    return HttpResponse.json(buildCartResponse(context.cart));
  }),

  http.delete("/api/cart/items/:nftId/:editionId", ({ params }) => {
    const context = getCartContext();
    const nftId = String(params.nftId);
    const editionId = String(params.editionId);

    context.cart.items = context.cart.items.filter(
      (item) => !(item.nftId === nftId && item.editionId === editionId),
    );

    if (context.cart.items.length === 0) {
      context.cart.couponCode = null;
    }

    context.cart.updatedAt = new Date().toISOString();
    writeMockDatabase(context.database);

    return HttpResponse.json(buildCartResponse(context.cart));
  }),

  http.post("/api/cart/coupon", async ({ request }) => {
    const requestBody = await request.json().catch(() => null);

    const requestResult = applyCouponRequestSchema.safeParse(requestBody);

    if (!requestResult.success) {
      return createCartError(
        "VALIDATION_ERROR",
        "Informe um código de cupom.",
        400,
        requestResult.error.flatten().fieldErrors as Record<string, string[]>,
      );
    }

    const context = getCartContext();

    if (context.cart.items.length === 0) {
      return createCartError(
        "VALIDATION_ERROR",
        "Adicione um item antes de aplicar o cupom.",
        400,
      );
    }

    const normalizedCode = requestResult.data.code.toLocaleUpperCase("pt-BR");

    const coupon = couponFixtures.find((item) => item.code === normalizedCode);

    if (!coupon) {
      return createCartError(
        "INVALID_COUPON",
        "O cupom informado não é válido.",
        422,
        {
          code: ["Cupom inválido."],
        },
      );
    }

    if (new Date(coupon.expiresAt).getTime() <= Date.now()) {
      return createCartError(
        "EXPIRED_COUPON",
        "O cupom informado está expirado.",
        422,
        {
          code: ["Cupom expirado."],
        },
      );
    }

    context.cart.couponCode = coupon.code;
    context.cart.updatedAt = new Date().toISOString();
    writeMockDatabase(context.database);

    return HttpResponse.json(buildCartResponse(context.cart));
  }),

  http.delete("/api/cart/coupon", () => {
    const context = getCartContext();

    context.cart.couponCode = null;
    context.cart.updatedAt = new Date().toISOString();
    writeMockDatabase(context.database);

    return HttpResponse.json(buildCartResponse(context.cart));
  }),
];
