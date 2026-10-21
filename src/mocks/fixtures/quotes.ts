import { moneyAmountSchema } from "@/contracts";

export const quoteNetworkFeeFixture = moneyAmountSchema.parse("0.016");

export const quoteDurationInMilliseconds = 5 * 60 * 1000;
