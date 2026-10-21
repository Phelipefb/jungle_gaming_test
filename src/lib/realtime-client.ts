import type { Socket } from "socket.io-client";

import type {
  NftUpdatedPayload,
  OrderUpdatedPayload,
  RealtimeReadyPayload,
} from "@/contracts";

interface ServerToClientEvents {
  "realtime.ready": (payload: RealtimeReadyPayload) => void;
  "nft.updated": (payload: NftUpdatedPayload) => void;
  "order.updated": (payload: OrderUpdatedPayload) => void;
}

let socket: Socket<ServerToClientEvents> | null = null;

export async function getRealtimeClient() {
  if (socket) {
    return socket;
  }

  const { io } = await import("socket.io-client");

  socket = io(window.location.origin, {
    autoConnect: false,
    transports: ["websocket"],
  });

  return socket;
}

export function disconnectRealtimeClient() {
  socket?.disconnect();
  socket = null;
}
