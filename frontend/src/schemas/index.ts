import { z } from "zod";

export const RegisterSchema = z
  .object({
    email: z.email("Correo no válido").min(1, "El correo es obligatorio"),
    name: z.string().min(1, "El nombre es obligatorio"),
    password: z
      .string()
      .min(8, "La constraseña es muy corta, mínimo 8 caracteres"),
    password_confirmation: z.string(),
  })
  .refine((data) => data.password === data.password_confirmation, {
    error: "Las constraseñas no son iguales",
    path: ["password_confirmation"],
  });

export const LoginSchema = z.object({
  email: z.email("Correo no válido").min(1, "El correo es obligatorio"),
  password: z.string().min(1, { message: "La contraseña es obligatoria" }),
});

export const TokenSchema = z
  .string("Token no válido")
  .length(6, "Token no válido");

export const SuccessSchema = z.string();
export const ErrorResponseSchema = z.object({
  error: z.string(),
});

export const UserSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.email(),
});

export type User = z.infer<typeof UserSchema>;
