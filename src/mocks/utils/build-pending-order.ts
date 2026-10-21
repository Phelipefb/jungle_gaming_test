import {
  pendingOrderSchema,
  type CheckoutRequest,
  type PendingOrder,
  type Quote,
} from "@/contracts";
import { getCurrentNfts } from "@/mocks/utils/get-current-nfts";

type BuildPendingOrderResult =
  | {
      success: true;
      order: PendingOrder;
    }
  | {
      success: false;
      message: string;
    };

export function buildPendingOrder(
  request: CheckoutRequest,
  quote: Quote,
): BuildPendingOrderResult {
  const currentNfts = getCurrentNfts();
  const items = [];

  for (const quoteItem of quote.items) {
    const nft = currentNfts.find((item) => item.id === quoteItem.nftId);

    const edition = nft?.editions.find(
      (item) => item.id === quoteItem.editionId,
    );

    if (!nft || !edition) {
      return {
        success: false,
        message: "Um item da cotação não está mais disponível.",
      };
    }

    items.push({
      nftId: nft.id,
      editionId: edition.id,
      editionName: edition.name,
      name: nft.name,
      imageUrl: nft.imageUrl,
      unitPrice: quoteItem.unitPrice,
      quantity: quoteItem.quantity,
    });
  }

  const now = new Date().toISOString();

  const order = pendingOrderSchema.parse({
    id: `order-${crypto.randomUUID()}`,
    quoteId: quote.id,
    items,
    coupon: quote.coupon,
    totals: quote.totals,
    paymentMethodId: request.paymentMethodId,
    networkId: request.networkId,
    version: 1,
    status: "PENDING",
    transaction: null,
    createdAt: now,
    updatedAt: now,
  });

  return {
    success: true,
    order,
  };
}
