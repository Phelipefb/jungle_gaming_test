import Decimal from "decimal.js";

import {
  quoteSchema,
  type Quote,
  type QuoteChange,
  type QuoteItem,
  type QuoteRequest,
} from "@/contracts";
import { getCurrentNfts } from "@/mocks/utils/get-current-nfts";
import {
  quoteDurationInMilliseconds,
  quoteNetworkFeeFixture,
} from "@/mocks/fixtures/quotes";
import { calculateQuoteTotals } from "@/mocks/utils/calculate-quote-totals";

type BuildQuoteFailure = {
  success: false;
  code: "VALIDATION_ERROR" | "NOT_FOUND";
  message: string;
  fieldErrors?: Record<string, string[]>;
};

type BuildQuoteSuccess = {
  success: true;
  quote: Quote;
};

export type BuildQuoteResult = BuildQuoteFailure | BuildQuoteSuccess;

function addChange(changes: QuoteChange[], change: QuoteChange) {
  const alreadyExists = changes.some(
    (item) => item.type === change.type && item.nftId === change.nftId,
  );

  if (!alreadyExists) {
    changes.push(change);
  }
}

export function buildQuote(request: QuoteRequest): BuildQuoteResult {
  const currentNfts = getCurrentNfts();
  const quoteItems: QuoteItem[] = [];
  const changes: QuoteChange[] = [];
  const itemKeys = new Set<string>();
  let unavailable = false;

  for (const requestedItem of request.items) {
    const itemKey = `${requestedItem.nftId}:${requestedItem.editionId}`;

    if (itemKeys.has(itemKey)) {
      return {
        success: false,
        code: "VALIDATION_ERROR",
        message: "A cotação possui itens duplicados.",
        fieldErrors: {
          items: ["Cada NFT e edição deve aparecer somente uma vez."],
        },
      };
    }

    itemKeys.add(itemKey);

    const nft = currentNfts.find((item) => item.id === requestedItem.nftId);

    if (!nft) {
      return {
        success: false,
        code: "NOT_FOUND",
        message: "NFT não encontrado.",
      };
    }

    const edition = nft.editions.find(
      (item) => item.id === requestedItem.editionId,
    );

    if (!edition) {
      return {
        success: false,
        code: "NOT_FOUND",
        message: "Edição não encontrada.",
      };
    }

    const priceChanged = !new Decimal(requestedItem.unitPrice.amount).equals(
      nft.price.amount,
    );

    if (priceChanged) {
      addChange(changes, {
        type: "PRICE_CHANGED",
        nftId: nft.id,
        message: `O preço de ${nft.name} foi atualizado.`,
      });
    }

    if (requestedItem.version !== nft.version && !priceChanged) {
      addChange(changes, {
        type: "AVAILABILITY_CHANGED",
        nftId: nft.id,
        message: `A disponibilidade de ${nft.name} foi atualizada.`,
      });
    }

    if (requestedItem.quantity > edition.maxPerOrder) {
      unavailable = true;

      addChange(changes, {
        type: "AVAILABILITY_CHANGED",
        nftId: nft.id,
        message: `O limite da edição ${edition.name} é ${edition.maxPerOrder}.`,
      });
    }

    if (
      edition.type === "LIMITED" &&
      requestedItem.quantity > edition.available
    ) {
      unavailable = true;

      addChange(changes, {
        type: "AVAILABILITY_CHANGED",
        nftId: nft.id,
        message: `A edição ${edition.name} não possui unidades suficientes.`,
      });
    }

    const quoteItemBase = {
      nftId: nft.id,
      editionId: edition.id,
      quantity: requestedItem.quantity,
      maxPerOrder: edition.maxPerOrder,
      unitPrice: nft.price,
      version: nft.version,
    };

    if (edition.type === "LIMITED") {
      quoteItems.push({
        ...quoteItemBase,
        editionType: "LIMITED",
        available: edition.available,
      });
    } else {
      quoteItems.push({
        ...quoteItemBase,
        editionType: "OPEN",
        available: null,
      });
    }
  }

  const { coupon, couponIsValid, totals } = calculateQuoteTotals({
    items: quoteItems.map((item) => ({
      unitPrice: item.unitPrice.amount,
      quantity: item.quantity,
    })),
    couponCode: request.couponCode,
    networkFee: quoteNetworkFeeFixture,
  });

  if (request.couponCode !== null && !couponIsValid) {
    addChange(changes, {
      type: "COUPON_CHANGED",
      nftId: null,
      message: "O cupom não está mais disponível.",
    });
  }

  if (!new Decimal(request.networkFee).equals(quoteNetworkFeeFixture)) {
    addChange(changes, {
      type: "NETWORK_FEE_CHANGED",
      nftId: null,
      message: "A taxa de rede foi atualizada.",
    });
  }

  const status: Quote["status"] = unavailable
    ? "UNAVAILABLE"
    : changes.length > 0
      ? "CHANGED"
      : "VALID";

  const createdAt = new Date();

  const quote = quoteSchema.parse({
    id: `quote-${crypto.randomUUID()}`,
    status,
    networkId: request.networkId,
    items: quoteItems,
    coupon,
    totals,
    changes,
    createdAt: createdAt.toISOString(),
    expiresAt: new Date(
      createdAt.getTime() + quoteDurationInMilliseconds,
    ).toISOString(),
  });

  return {
    success: true,
    quote,
  };
}
