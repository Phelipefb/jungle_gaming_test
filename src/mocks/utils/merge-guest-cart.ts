import { nftFixtures } from "@/mocks/fixtures/nfts";
import { createEmptyMockCart } from "@/mocks/state/cart";
import type { MockDatabase } from "@/mocks/state/database";

export function mergeGuestCart(database: MockDatabase, userId: string) {
  const guestCart = database.cartsByOwner.guest ?? createEmptyMockCart();

  const userCart = database.cartsByOwner[userId] ?? createEmptyMockCart();

  for (const guestItem of guestCart.items) {
    const nft = nftFixtures.find((item) => item.id === guestItem.nftId);

    const edition = nft?.editions.find(
      (item) => item.id === guestItem.editionId,
    );

    if (!nft || !edition) {
      continue;
    }

    const maximumQuantity =
      edition.type === "LIMITED"
        ? Math.min(edition.maxPerOrder, edition.available)
        : edition.maxPerOrder;

    if (maximumQuantity === 0) {
      continue;
    }

    const userItem = userCart.items.find(
      (item) =>
        item.nftId === guestItem.nftId &&
        item.editionId === guestItem.editionId,
    );

    if (userItem) {
      userItem.quantity = Math.min(
        userItem.quantity + guestItem.quantity,
        maximumQuantity,
      );
    } else {
      userCart.items.push({
        ...guestItem,
        quantity: Math.min(guestItem.quantity, maximumQuantity),
      });
    }
  }

  if (!userCart.couponCode && guestCart.couponCode) {
    userCart.couponCode = guestCart.couponCode;
  }

  if (guestCart.items.length > 0) {
    userCart.updatedAt = new Date().toISOString();
  }

  database.cartsByOwner[userId] = userCart;
  database.cartsByOwner.guest = createEmptyMockCart();
}
