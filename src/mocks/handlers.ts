import { http, HttpResponse } from "msw";
import { nftHandlers } from "@/mocks/handlers/nfts";
import { authHandlers } from "@/mocks/handlers/auth";
import { scenarioHandlers } from "@/mocks/handlers/scenarios";
import { favoriteHandlers } from "@/mocks/handlers/favorites";
import { cartHandlers } from "@/mocks/handlers/cart";
import { walletHandlers } from "@/mocks/handlers/wallets";
import { quoteHandlers } from "@/mocks/handlers/quotes";
import { orderHandlers } from "@/mocks/handlers/orders";
import { realtimeHandler } from "@/mocks/realtime";

export const handlers = [
  http.get("/api/health", () => {
    return HttpResponse.json({
      status: "ok",
    });
  }),

  realtimeHandler,

  ...cartHandlers,
  ...quoteHandlers,
  ...orderHandlers,
  ...walletHandlers,
  ...favoriteHandlers,
  ...scenarioHandlers,
  ...authHandlers,
  ...nftHandlers,
];
