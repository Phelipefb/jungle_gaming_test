import {
  confirmedOrderSchema,
  declinedOrderSchema,
  type Order,
} from "@/contracts";
import type { MockDatabase } from "@/mocks/state/database";

type ResolvePendingOrderResult =
  | {
      success: true;
      order: Order;
    }
  | {
      success: false;
      message: string;
    };

function createTransactionHash(orderId: string) {
  const normalizedId = orderId.replace("order-", "").replaceAll("-", "");

  return `0x${normalizedId.padEnd(64, "0").slice(0, 64)}`;
}

export function resolvePendingOrder(
  database: MockDatabase,
  userId: string,
  orderId: string,
): ResolvePendingOrderResult {
  const orders = database.ordersByUser[userId] ?? [];
  const existingOrder = orders.find((order) => order.id === orderId);

  if (!existingOrder) {
    return {
      success: false,
      message: "Pedido não encontrado.",
    };
  }

  if (existingOrder.status !== "PENDING") {
    return {
      success: true,
      order: existingOrder,
    };
  }

  const outcome = database.pendingOrderOutcomes[orderId];

  if (!outcome) {
    return {
      success: false,
      message: "O resultado pendente do pedido não foi encontrado.",
    };
  }

  const updatedAt = new Date().toISOString();
  const nextVersion = existingOrder.version + 1;

  const resolvedOrder =
    outcome === "CONFIRMED"
      ? confirmedOrderSchema.parse({
          ...existingOrder,
          status: "CONFIRMED",
          version: nextVersion,
          updatedAt,
          transaction: {
            hash: createTransactionHash(existingOrder.id),
            explorerUrl: `https://explorer.kurio.test/tx/${createTransactionHash(existingOrder.id)}`,
          },
        })
      : declinedOrderSchema.parse({
          ...existingOrder,
          status: "DECLINED",
          version: nextVersion,
          updatedAt,
          transaction: null,
          failureReason: "A transação foi recusada pela carteira ou pela rede.",
        });

  database.ordersByUser[userId] = orders.map((order) =>
    order.id === orderId ? resolvedOrder : order,
  );

  delete database.pendingOrderOutcomes[orderId];

  return {
    success: true,
    order: resolvedOrder,
  };
}
