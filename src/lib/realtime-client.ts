import type { Socket } from "socket.io-client";

export interface RealtimeReadyEvent {
  version: number;
}

interface ServerToClientEvents {
  "realtime.ready": (payload: RealtimeReadyEvent) => void;
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
