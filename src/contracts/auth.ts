import { z } from "zod";

export const userSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  email: z.string().email(),
  avatarUrl: z.string().min(1).nullable(),
});

export const loginRequestSchema = z.object({
  email: z.string().email("Informe um e-mail válido"),
  password: z.string().min(1, "Informe a senha"),
});

export const registerRequestSchema = z.object({
  name: z.string().min(2, "Informe seu nome"),
  email: z.string().email("Informe um e-mail válido"),
  password: z.string().min(8, "A senha deve possuir pelo menos 8 caracteres"),
});

export const sessionSchema = z.object({
  accessToken: z.string().min(1),
  expiresAt: z.string().datetime({ offset: true }),
  user: userSchema,
});

export const authResponseSchema = z.object({
  session: sessionSchema,
});

export type User = z.infer<typeof userSchema>;
export type LoginRequest = z.infer<typeof loginRequestSchema>;
export type RegisterRequest = z.infer<typeof registerRequestSchema>;
export type Session = z.infer<typeof sessionSchema>;
export type AuthResponse = z.infer<typeof authResponseSchema>;
