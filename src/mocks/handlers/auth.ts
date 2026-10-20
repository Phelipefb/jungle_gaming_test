import { http, HttpResponse } from "msw";
import type { z } from "zod";

import {
  apiErrorResponseSchema,
  authResponseSchema,
  loginRequestSchema,
  registerRequestSchema,
  type User,
} from "@/contracts";
import {
  readMockDatabase,
  writeMockDatabase,
  type MockDatabase,
} from "@/mocks/state/database";
import { hashPassword, verifyPassword } from "@/mocks/utils/hash-password";

const sessionDurationInMilliseconds = 60 * 60 * 1000;

function createErrorResponse(
  code: "VALIDATION_ERROR" | "UNAUTHENTICATED" | "SESSION_EXPIRED" | "CONFLICT",
  message: string,
  status: number,
  fieldErrors?: Record<string, string[]>,
) {
  return HttpResponse.json(
    apiErrorResponseSchema.parse({
      error: {
        code,
        message,
        fieldErrors,
      },
    }),
    { status },
  );
}

function createValidationResponse(error: z.ZodError) {
  return createErrorResponse(
    "VALIDATION_ERROR",
    "Verifique os campos informados.",
    400,
    error.flatten().fieldErrors as Record<string, string[]>,
  );
}

function createAuthenticatedSession(database: MockDatabase, user: User) {
  const session = {
    accessToken: `mock-${crypto.randomUUID()}`,
    userId: user.id,
    expiresAt: new Date(
      Date.now() + sessionDurationInMilliseconds,
    ).toISOString(),
  };

  database.session = session;
  writeMockDatabase(database);

  return authResponseSchema.parse({
    session: {
      accessToken: session.accessToken,
      expiresAt: session.expiresAt,
      user,
    },
  });
}

export const authHandlers = [
  http.post("/api/auth/register", async ({ request }) => {
    let requestBody: unknown;

    try {
      requestBody = await request.json();
    } catch {
      return createErrorResponse(
        "VALIDATION_ERROR",
        "O corpo da requisição é inválido.",
        400,
      );
    }

    const requestResult = registerRequestSchema.safeParse(requestBody);

    if (!requestResult.success) {
      return createValidationResponse(requestResult.error);
    }

    const database = readMockDatabase();
    const normalizedEmail = requestResult.data.email.toLocaleLowerCase("pt-BR");

    const accountAlreadyExists = database.accounts.some(
      ({ user }) => user.email.toLocaleLowerCase("pt-BR") === normalizedEmail,
    );

    if (accountAlreadyExists) {
      return createErrorResponse(
        "CONFLICT",
        "Já existe uma conta com este e-mail.",
        409,
        {
          email: ["Já existe uma conta com este e-mail."],
        },
      );
    }

    let passwordHash: string;

    try {
      passwordHash = await hashPassword(requestResult.data.password);
    } catch {
      return createErrorResponse(
        "VALIDATION_ERROR",
        "A senha ultrapassa o limite suportado.",
        400,
        {
          password: ["A senha ultrapassa o limite suportado."],
        },
      );
    }

    const user = {
      id: `user-${crypto.randomUUID()}`,
      name: requestResult.data.name,
      email: normalizedEmail,
      avatarUrl: null,
    };

    database.accounts.push({
      user,
      passwordHash,
    });

    return HttpResponse.json(createAuthenticatedSession(database, user), {
      status: 201,
    });
  }),

  http.post("/api/auth/login", async ({ request }) => {
    let requestBody: unknown;

    try {
      requestBody = await request.json();
    } catch {
      return createErrorResponse(
        "VALIDATION_ERROR",
        "O corpo da requisição é inválido.",
        400,
      );
    }

    const requestResult = loginRequestSchema.safeParse(requestBody);

    if (!requestResult.success) {
      return createValidationResponse(requestResult.error);
    }

    const database = readMockDatabase();
    const normalizedEmail = requestResult.data.email.toLocaleLowerCase("pt-BR");

    const account = database.accounts.find(
      ({ user }) => user.email.toLocaleLowerCase("pt-BR") === normalizedEmail,
    );

    const passwordIsValid =
      account !== undefined &&
      (await verifyPassword(requestResult.data.password, account.passwordHash));

    if (!account || !passwordIsValid) {
      return createErrorResponse(
        "UNAUTHENTICATED",
        "E-mail ou senha inválidos.",
        401,
      );
    }

    return HttpResponse.json(
      createAuthenticatedSession(database, account.user),
    );
  }),

  http.get("/api/auth/session", () => {
    const database = readMockDatabase();
    const session = database.session;

    if (!session) {
      return createErrorResponse(
        "UNAUTHENTICATED",
        "Não existe uma sessão ativa.",
        401,
      );
    }

    if (new Date(session.expiresAt).getTime() <= Date.now()) {
      database.session = null;
      writeMockDatabase(database);

      return createErrorResponse(
        "SESSION_EXPIRED",
        "A sessão expirou. Entre novamente.",
        401,
      );
    }

    const account = database.accounts.find(
      ({ user }) => user.id === session.userId,
    );

    if (!account) {
      database.session = null;
      writeMockDatabase(database);

      return createErrorResponse(
        "UNAUTHENTICATED",
        "A conta da sessão não foi encontrada.",
        401,
      );
    }

    return HttpResponse.json(
      authResponseSchema.parse({
        session: {
          accessToken: session.accessToken,
          expiresAt: session.expiresAt,
          user: account.user,
        },
      }),
    );
  }),

  http.post("/api/auth/logout", () => {
    const database = readMockDatabase();
    database.session = null;
    writeMockDatabase(database);

    return new HttpResponse(null, { status: 204 });
  }),
];
