import { http, HttpResponse } from "msw";

import { apiErrorResponseSchema } from "@/contracts";
import {
  readMockDatabase,
  resetMockDatabase,
  writeMockDatabase,
} from "@/mocks/state/database";

export const scenarioHandlers = [
  http.post("/api/mock/reset", () => {
    resetMockDatabase();

    return new HttpResponse(null, { status: 204 });
  }),

  http.post("/api/mock/session/expire", () => {
    const database = readMockDatabase();

    if (!database.session) {
      return HttpResponse.json(
        apiErrorResponseSchema.parse({
          error: {
            code: "UNAUTHENTICATED",
            message: "Não existe uma sessão ativa.",
          },
        }),
        { status: 401 },
      );
    }

    database.session.expiresAt = new Date(Date.now() - 60_000).toISOString();

    writeMockDatabase(database);

    return new HttpResponse(null, { status: 204 });
  }),

  http.post("/api/mock/wallet-connection/refuse-next", () => {
    const database = readMockDatabase();

    database.nextWalletConnectionOutcome = "REFUSED";

    writeMockDatabase(database);

    return new HttpResponse(null, { status: 204 });
  }),
];
