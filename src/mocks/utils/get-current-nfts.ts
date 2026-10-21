import { nftSchema, type Nft } from "@/contracts";
import { nftFixtures } from "@/mocks/fixtures/nfts";
import { readMockDatabase, type MockDatabase } from "@/mocks/state/database";

export function getCurrentNfts(database?: MockDatabase): Nft[] {
  const currentDatabase = database ?? readMockDatabase();

  return nftFixtures.map((nft) => {
    const override = currentDatabase.nftOverridesById[nft.id];

    if (!override) {
      return nft;
    }

    return nftSchema.parse({
      ...nft,
      price: override.price,
      editions: override.editions,
      version: override.version,
    });
  });
}

export function getCurrentNft(nftId: string, database?: MockDatabase) {
  return getCurrentNfts(database).find((nft) => nft.id === nftId);
}
