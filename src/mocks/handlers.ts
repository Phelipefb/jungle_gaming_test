import { toSocketIo } from "@mswjs/socket.io-binding";
import { http, HttpResponse, ws } from "msw";
import { nftHandlers } from "@/mocks/handlers/nfts";

const realtime = ws.link("/");

export const handlers = [
  http.get("/api/health", () => {
    return HttpResponse.json({
      status: "ok",
    });
  }),

  realtime.addEventListener("connection", (connection) => {
    const socket = toSocketIo(connection);

    socket.client.emit("realtime.ready", {
      version: 1,
    });
  }),

  ...nftHandlers,
];
