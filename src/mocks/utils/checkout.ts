import type { CheckoutRequest, Quote } from "@/contracts";

function sortItems<
  T extends {
    nftId: string;
    editionId: string;
    quantity: number;
  },
>(items: T[]) {
  return [...items].sort((first, second) =>
    `${first.nftId}:${first.editionId}`.localeCompare(
      `${second.nftId}:${second.editionId}`,
    ),
  );
}

export function checkoutItemsMatchQuote(
  request: CheckoutRequest,
  quote: Quote,
) {
  const requestedItems = sortItems(request.items).map(
    ({ nftId, editionId, quantity }) => ({
      nftId,
      editionId,
      quantity,
    }),
  );

  const quotedItems = sortItems(quote.items).map(
    ({ nftId, editionId, quantity }) => ({
      nftId,
      editionId,
      quantity,
    }),
  );

  return JSON.stringify(requestedItems) === JSON.stringify(quotedItems);
}

export function createCheckoutFingerprint(request: CheckoutRequest) {
  const normalizedRequest = {
    items: sortItems(request.items),
    couponCode: request.couponCode?.toLocaleUpperCase("pt-BR") ?? null,
    paymentMethodId: request.paymentMethodId,
    networkId: request.networkId,
    quoteId: request.quoteId,
  };

  return JSON.stringify(normalizedRequest);
}
