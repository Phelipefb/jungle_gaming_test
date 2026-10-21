import { http, HttpResponse } from "msw";

import {
  apiErrorResponseSchema,
  profileResponseSchema,
  updateProfileRequestSchema,
  updateProfileResponseSchema,
  changePasswordRequestSchema,
  type ApiErrorCode,
} from "@/contracts";
import { writeMockDatabase } from "@/mocks/state/database";
import { getAuthenticatedContext } from "@/mocks/utils/get-authenticated-context";
import { hashPassword, verifyPassword } from "@/mocks/utils/hash-password";

function createAuthenticationError(
  code: "UNAUTHENTICATED" | "SESSION_EXPIRED",
  message: string,
) {
  return HttpResponse.json(
    apiErrorResponseSchema.parse({
      error: {
        code,
        message,
      },
    }),
    { status: 401 },
  );
}

function createProfileError(
  code: ApiErrorCode,
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

export const profileHandlers = [
  http.get("/api/profile", () => {
    const context = getAuthenticatedContext();

    if (!context.authenticated) {
      return createAuthenticationError(context.code, context.message);
    }

    return HttpResponse.json(
      profileResponseSchema.parse({
        user: context.account.user,
      }),
    );
  }),

  http.patch("/api/profile", async ({ request }) => {
    const context = getAuthenticatedContext();

    if (!context.authenticated) {
      return createAuthenticationError(context.code, context.message);
    }

    const requestBody = await request.json().catch(() => null);

    const requestResult = updateProfileRequestSchema.safeParse(requestBody);

    if (!requestResult.success) {
      return createProfileError(
        "VALIDATION_ERROR",
        "Verifique os dados do perfil.",
        400,
        requestResult.error.flatten().fieldErrors as Record<string, string[]>,
      );
    }

    const normalizedEmail = requestResult.data.email.toLocaleLowerCase("pt-BR");

    const emailAlreadyExists = context.database.accounts.some(
      ({ user }) =>
        user.id !== context.account.user.id &&
        user.email.toLocaleLowerCase("pt-BR") === normalizedEmail,
    );

    if (emailAlreadyExists) {
      return createProfileError(
        "CONFLICT",
        "Já existe uma conta com este e-mail.",
        409,
        {
          email: ["Já existe uma conta com este e-mail."],
        },
      );
    }

    context.account.user = {
      ...context.account.user,
      name: requestResult.data.name,
      email: normalizedEmail,
      avatarUrl: requestResult.data.avatarUrl,
    };

    writeMockDatabase(context.database);

    return HttpResponse.json(
      updateProfileResponseSchema.parse({
        user: context.account.user,
      }),
    );
  }),

  http.post("/api/profile/password", async ({ request }) => {
    const context = getAuthenticatedContext();

    if (!context.authenticated) {
      return createAuthenticationError(context.code, context.message);
    }

    const requestBody = await request.json().catch(() => null);

    const requestResult = changePasswordRequestSchema.safeParse(requestBody);

    if (!requestResult.success) {
      return createProfileError(
        "VALIDATION_ERROR",
        "Verifique os dados da senha.",
        400,
        requestResult.error.flatten().fieldErrors as Record<string, string[]>,
      );
    }

    const currentPasswordIsValid = await verifyPassword(
      requestResult.data.currentPassword,
      context.account.passwordHash,
    );

    if (!currentPasswordIsValid) {
      return createProfileError(
        "VALIDATION_ERROR",
        "A senha atual está incorreta.",
        400,
        {
          currentPassword: ["A senha atual está incorreta."],
        },
      );
    }

    let newPasswordHash: string;

    try {
      newPasswordHash = await hashPassword(requestResult.data.newPassword);
    } catch {
      return createProfileError(
        "VALIDATION_ERROR",
        "A nova senha ultrapassa o limite suportado.",
        400,
        {
          newPassword: ["A nova senha ultrapassa o limite suportado."],
        },
      );
    }

    context.account.passwordHash = newPasswordHash;

    writeMockDatabase(context.database);

    return new HttpResponse(null, {
      status: 204,
    });
  }),
];
