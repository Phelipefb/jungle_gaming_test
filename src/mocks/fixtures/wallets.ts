import { walletNetworkSchema, walletSchema, type Wallet } from "@/contracts";

export const walletNetworkFixtures = walletNetworkSchema.array().parse([
  {
    id: "ethereum",
    name: "Ethereum",
  },
  {
    id: "polygon",
    name: "Polygon",
  },
  {
    id: "solana",
    name: "Solana",
  },
]);

const fixtureDate = "2026-01-01T12:00:00.000Z";

export const walletFixturesByUser: Record<string, Wallet[]> = {
  "user-ana-costa": walletSchema.array().parse([
    {
      id: "wallet-ana-primary",
      displayName: "Principal",
      profileName: "Ana Costa",
      email: "ana@kurio.test",
      address: `0xA91F${"0".repeat(32)}E82C`,
      ensName: null,
      referralCode: null,
      provider: "METAMASK",
      network: {
        id: "ethereum",
        name: "Ethereum",
      },
      status: "CONNECTED",
      primary: true,
      createdAt: fixtureDate,
      updatedAt: fixtureDate,
    },
    {
      id: "wallet-ana-reserve",
      displayName: "Reserva",
      profileName: "Nova Kurio",
      email: "ana@kurio.test",
      address: `0xB72C${"0".repeat(32)}4F19`,
      ensName: "nova.kurio.eth",
      referralCode: null,
      provider: "WALLET_CONNECT",
      network: {
        id: "polygon",
        name: "Polygon",
      },
      status: "DISCONNECTED",
      primary: false,
      createdAt: fixtureDate,
      updatedAt: fixtureDate,
    },
  ]),
  "user-leo-martins": walletSchema.array().parse([
    {
      id: "wallet-leo-primary",
      displayName: "Principal",
      profileName: "Leo Martins",
      email: "leo@kurio.test",
      address: `9xLm${"2".repeat(36)}`,
      ensName: null,
      referralCode: null,
      provider: "COINBASE_WALLET",
      network: {
        id: "solana",
        name: "Solana",
      },
      status: "DISCONNECTED",
      primary: true,
      createdAt: fixtureDate,
      updatedAt: fixtureDate,
    },
  ]),
};
