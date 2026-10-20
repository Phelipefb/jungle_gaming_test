import { z } from "zod";

import { userSchema } from "@/contracts";

export const mockAccountSchema = z.object({
  user: userSchema,
  passwordHash: z.string().regex(/^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/),
});

export const accountFixtures = mockAccountSchema.array().parse([
  {
    user: {
      id: "user-ana-costa",
      name: "Ana Costa",
      email: "ana@kurio.test",
      avatarUrl: null,
    },
    passwordHash:
      "$2b$10$YgMO7kZUVM7jZg/phYO1weEVdqOe26VHYKcwaMeZUPf/tyRI5o50u",
  },
  {
    user: {
      id: "user-leo-martins",
      name: "Leo Martins",
      email: "leo@kurio.test",
      avatarUrl: null,
    },
    passwordHash:
      "$2b$10$2UhkWesFgcNXTlSUOiJBW.EsRs34fDgALg8Om9BfpJzJrIKWXtroO",
  },
]);

export type MockAccount = z.infer<typeof mockAccountSchema>;
