import { createEmptyMockCart, type MockCart } from "@/mocks/state/cart";
import type { MockDatabase } from "@/mocks/state/database";
import { getAuthenticatedContext } from "@/mocks/utils/get-authenticated-context";

type MockCartContext = {
  database: MockDatabase;
  ownerId: string;
  cart: MockCart;
};

export function getCartContext(): MockCartContext {
  const authentication = getAuthenticatedContext();
  const database = authentication.database;

  const ownerId = authentication.authenticated
    ? authentication.account.user.id
    : "guest";

  const cart = database.cartsByOwner[ownerId] ?? createEmptyMockCart();

  database.cartsByOwner[ownerId] = cart;

  return {
    database,
    ownerId,
    cart,
  };
}
