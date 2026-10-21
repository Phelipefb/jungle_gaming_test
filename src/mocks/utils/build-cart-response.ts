import Decimal from "decimal.js";

import { cartSchema, type Cart } from "@/contracts";
import { couponFixtures } from "@/mocks/fixtures/coupons";
import { nftFixtures } from "@/mocks/fixtures/nfts";
import type { MockCart } from "@/mocks/state/cart";

const defaultNetworkFee = new Decimal("0.02");

function serializeAmount(value: Decimal) {
  return value.toDecimalPlaces(18).toString();
}

export function buildCartResponse(mockCart: MockCart): Cart {
  const items = mockCart.items.map((mockItem) => {
    const nft = nftFixtures.find((item) => item.id === mockItem.nftId);

    if (!nft) {
      throw new Error(`NFT do carrinho não encontrado: ${mockItem.nftId}`);
    }

    const edition = nft.editions.find((item) => item.id === mockItem.editionId);

    if (!edition) {
      throw new Error(
        `Edição do carrinho não encontrada: ${mockItem.editionId}`,
      );
    }

    return {
      nft,
      editionId: edition.id,
      quantity: mockItem.quantity,
    };
  });

  const subtotal = items.reduce(
    (total, item) =>
      total.plus(new Decimal(item.nft.price.amount).times(item.quantity)),
    new Decimal(0),
  );

  const couponFixture = couponFixtures.find(
    (coupon) => coupon.code === mockCart.couponCode,
  );

  const couponIsValid =
    couponFixture !== undefined &&
    new Date(couponFixture.expiresAt).getTime() > Date.now();

  const discount = couponIsValid
    ? subtotal.times(
        new Decimal(couponFixture.discountPercentage).dividedBy(100),
      )
    : new Decimal(0);

  const networkFee = items.length > 0 ? defaultNetworkFee : new Decimal(0);

  const total = subtotal.minus(discount).plus(networkFee);

  return cartSchema.parse({
    items,
    coupon: couponIsValid
      ? {
          code: couponFixture.code,
          discountAmount: serializeAmount(discount),
        }
      : null,
    totals: {
      subtotal: serializeAmount(subtotal),
      discount: serializeAmount(discount),
      networkFee: serializeAmount(networkFee),
      total: serializeAmount(total),
      currency: "ETH",
    },
    updatedAt: mockCart.updatedAt,
  });
}
