import { z } from "zod";
import {
  favoriteSchema,
  orderSchema,
  quoteSchema,
  walletSchema,
} from "@/contracts";
import { createEmptyMockCart, mockCartSchema } from "@/mocks/state/cart";
import { accountFixtures, mockAccountSchema } from "@/mocks/fixtures/accounts";
import { walletFixturesByUser } from "@/mocks/fixtures/wallets";

const storageKey = "kurio:mock-database:v1";

const mockSessionSchema = z.object({
  accessToken: z.string().min(1),
  userId: z.string().min(1),
  expiresAt: z.string().datetime({ offset: true }),
});

const mockIdempotencyRecordSchema = z.object({
  requestFingerprint: z.string().min(1),
  orderId: z.string().min(1),
});

const mockOrderOutcomeSchema = z.enum(["CONFIRMED", "DECLINED"]);

const mockDatabaseSchema = z.object({
  version: z.literal(1),
  accounts: z.array(mockAccountSchema),
  session: mockSessionSchema.nullable(),
  favoritesByUser: z.record(z.string(), z.array(favoriteSchema)),
  cartsByOwner: z.record(z.string(), mockCartSchema),
  walletsByUser: z.record(z.string(), z.array(walletSchema)),
  nextWalletConnectionOutcome: z.enum(["SUCCESS", "REFUSED"]),
  quotesByUser: z.record(z.string(), z.array(quoteSchema)),
  ordersByUser: z.record(z.string(), z.array(orderSchema)),
  checkoutIdempotencyByUser: z.record(
    z.string(),
    z.record(z.string(), mockIdempotencyRecordSchema),
  ),
  pendingOrderOutcomes: z.record(z.string(), mockOrderOutcomeSchema),
  nextCheckoutOutcome: z.enum(["CONFIRMED", "DECLINED", "TRANSIENT_ERROR"]),
});

export type MockSession = z.infer<typeof mockSessionSchema>;

export type MockDatabase = z.infer<typeof mockDatabaseSchema>;

function createInitialDatabase(): MockDatabase {
  return {
    version: 1,
    accounts: structuredClone(accountFixtures),
    session: null,
    favoritesByUser: Object.fromEntries(
      accountFixtures.map(({ user }) => [user.id, []]),
    ),
    cartsByOwner: {
      guest: createEmptyMockCart(),
      ...Object.fromEntries(
        accountFixtures.map(({ user }) => [user.id, createEmptyMockCart()]),
      ),
    },
    walletsByUser: structuredClone(walletFixturesByUser),
    quotesByUser: Object.fromEntries(
      accountFixtures.map(({ user }) => [user.id, []]),
    ),
    ordersByUser: Object.fromEntries(
      accountFixtures.map(({ user }) => [user.id, []]),
    ),
    checkoutIdempotencyByUser: Object.fromEntries(
      accountFixtures.map(({ user }) => [user.id, {}]),
    ),
    pendingOrderOutcomes: {},
    nextWalletConnectionOutcome: "SUCCESS",
    nextCheckoutOutcome: "CONFIRMED",
  };
}

export function readMockDatabase(): MockDatabase {
  const storedDatabase = localStorage.getItem(storageKey);

  if (!storedDatabase) {
    const initialDatabase = createInitialDatabase();
    writeMockDatabase(initialDatabase);

    return initialDatabase;
  }

  try {
    const parsedDatabase = mockDatabaseSchema.safeParse(
      JSON.parse(storedDatabase),
    );

    if (parsedDatabase.success) {
      return parsedDatabase.data;
    }
  } catch {
    // O reset abaixo restaura um cenário conhecido.
  }

  const initialDatabase = createInitialDatabase();
  writeMockDatabase(initialDatabase);

  return initialDatabase;
}

export function writeMockDatabase(database: MockDatabase) {
  const validatedDatabase = mockDatabaseSchema.parse(database);

  localStorage.setItem(storageKey, JSON.stringify(validatedDatabase));
}

export function resetMockDatabase() {
  const initialDatabase = createInitialDatabase();
  writeMockDatabase(initialDatabase);

  return initialDatabase;
}
