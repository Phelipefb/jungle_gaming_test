import { z } from "zod";

import { userSchema } from "@/contracts/auth";

export const profileResponseSchema = z.object({
  user: userSchema,
});

export const updateProfileRequestSchema = z.object({
  name: z.string().min(2, "Informe seu nome"),
  email: z.string().email("Informe um e-mail válido"),
  avatarUrl: z.string().min(1).nullable(),
});

export const updateProfileResponseSchema = z.object({
  user: userSchema,
});

export const changePasswordRequestSchema = z
  .object({
    currentPassword: z.string().min(1, "Informe a senha atual"),
    newPassword: z
      .string()
      .min(8, "A nova senha deve possuir pelo menos 8 caracteres"),
  })
  .refine(
    ({ currentPassword, newPassword }) => currentPassword !== newPassword,
    {
      path: ["newPassword"],
      message: "A nova senha deve ser diferente da senha atual",
    },
  );

export type ProfileResponse = z.infer<typeof profileResponseSchema>;
export type UpdateProfileRequest = z.infer<typeof updateProfileRequestSchema>;
export type UpdateProfileResponse = z.infer<typeof updateProfileResponseSchema>;
export type ChangePasswordRequest = z.infer<typeof changePasswordRequestSchema>;
