import type { MockAccount } from "@/mocks/fixtures/accounts";
import {
  readMockDatabase,
  writeMockDatabase,
  type MockDatabase,
  type MockSession,
} from "@/mocks/state/database";

type AuthenticatedContext = {
  authenticated: true;
  database: MockDatabase;
  account: MockAccount;
  session: MockSession;
};

type UnauthenticatedContext = {
  authenticated: false;
  code: "UNAUTHENTICATED" | "SESSION_EXPIRED";
  message: string;
};

export type MockAuthenticationContext =
  | AuthenticatedContext
  | UnauthenticatedContext;

export function getAuthenticatedContext(): MockAuthenticationContext {
  const database = readMockDatabase();
  const session = database.session;

  if (!session) {
    return {
      authenticated: false,
      code: "UNAUTHENTICATED",
      message: "Não existe uma sessão ativa.",
    };
  }

  if (new Date(session.expiresAt).getTime() <= Date.now()) {
    database.session = null;
    writeMockDatabase(database);

    return {
      authenticated: false,
      code: "SESSION_EXPIRED",
      message: "A sessão expirou. Entre novamente.",
    };
  }

  const account = database.accounts.find(
    ({ user }) => user.id === session.userId,
  );

  if (!account) {
    database.session = null;
    writeMockDatabase(database);

    return {
      authenticated: false,
      code: "UNAUTHENTICATED",
      message: "A conta da sessão não foi encontrada.",
    };
  }

  return {
    authenticated: true,
    database,
    account,
    session,
  };
}
