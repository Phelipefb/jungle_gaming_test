import { toSocketIo } from "@mswjs/socket.io-binding";
import { ws } from "msw";

import {
  nftUpdatedPayloadSchema,
  orderUpdatedPayloadSchema,
  realtimeReadyPayloadSchema,
  type NftUpdatedPayload,
  type OrderUpdatedPayload,
} from "@/contracts";

type SocketIoClient = ReturnType<typeof toSocketIo>["client"];

const realtime = ws.link("/");
const connectedClients = new Set<SocketIoClient>();

export const realtimeHandler = realtime.addEventListener(
  "connection",
  (connection) => {
    const socket = toSocketIo(connection);

    connectedClients.add(socket.client);

    connection.client.addEventListener("close", () => {
      connectedClients.delete(socket.client);
    });

    globalThis.queueMicrotask(() => {
      socket.client.emit(
        "realtime.ready",
        realtimeReadyPayloadSchema.parse({
          version: 1,
        }),
      );
    });
  },
);

export function emitOrderUpdated(payload: OrderUpdatedPayload) {
  const validatedPayload = orderUpdatedPayloadSchema.parse(payload);

  connectedClients.forEach((client) => {
    client.emit("order.updated", validatedPayload);
  });
}

export function emitNftUpdated(payload: NftUpdatedPayload) {
  const validatedPayload = nftUpdatedPayloadSchema.parse(payload);

  connectedClients.forEach((client) => {
    client.emit("nft.updated", validatedPayload);
  });
}
