import Decimal from "decimal.js";

import {
  appliedCouponSchema,
  cartTotalsSchema,
  type AppliedCoupon,
  type CartTotals,
} from "@/contracts";
import { couponFixtures } from "@/mocks/fixtures/coupons";

type QuoteTotalItem = {
  unitPrice: string;
  quantity: number;
};

type CalculateQuoteTotalsInput = {
  items: QuoteTotalItem[];
  couponCode: string | null;
  networkFee: string;
};

type CalculateQuoteTotalsResult = {
  coupon: AppliedCoupon | null;
  couponIsValid: boolean;
  totals: CartTotals;
};

function serializeAmount(value: Decimal) {
  return value.toDecimalPlaces(18).toString();
}

export function calculateQuoteTotals({
  items,
  couponCode,
  networkFee,
}: CalculateQuoteTotalsInput): CalculateQuoteTotalsResult {
  const subtotal = items.reduce(
    (total, item) =>
      total.plus(new Decimal(item.unitPrice).times(item.quantity)),
    new Decimal(0),
  );

  const normalizedCouponCode = couponCode?.toLocaleUpperCase("pt-BR") ?? null;

  const couponFixture = couponFixtures.find(
    (coupon) => coupon.code === normalizedCouponCode,
  );

  const couponIsValid =
    couponFixture !== undefined &&
    new Date(couponFixture.expiresAt).getTime() > Date.now();

  const discount = couponIsValid
    ? subtotal.times(
        new Decimal(couponFixture.discountPercentage).dividedBy(100),
      )
    : new Decimal(0);

  const coupon = couponIsValid
    ? appliedCouponSchema.parse({
        code: couponFixture.code,
        discountAmount: serializeAmount(discount),
      })
    : null;

  const fee = new Decimal(networkFee);
  const total = subtotal.minus(discount).plus(fee);

  const totals = cartTotalsSchema.parse({
    subtotal: serializeAmount(subtotal),
    discount: serializeAmount(discount),
    networkFee: serializeAmount(fee),
    total: serializeAmount(total),
    currency: "ETH",
  });

  return {
    coupon,
    couponIsValid,
    totals,
  };
}
