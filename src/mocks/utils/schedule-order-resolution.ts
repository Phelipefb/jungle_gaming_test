import { emitOrderUpdated } from "@/mocks/realtime";
import { readMockDatabase, writeMockDatabase } from "@/mocks/state/database";
import { resolvePendingOrder } from "@/mocks/utils/resolve-pending-order";

const orderResolutionDelay = 1200;

export function scheduleOrderResolution(userId: string, orderId: string) {
  globalThis.setTimeout(() => {
    const database = readMockDatabase();

    const order = (database.ordersByUser[userId] ?? []).find(
      (item) => item.id === orderId,
    );

    if (!order || order.status !== "PENDING") {
      return;
    }

    const result = resolvePendingOrder(database, userId, orderId);

    if (!result.success) {
      return;
    }

    writeMockDatabase(database);

    emitOrderUpdated({
      orderId: result.order.id,
      status: result.order.status,
      version: result.order.version,
      updatedAt: result.order.updatedAt,
    });
  }, orderResolutionDelay);
}
