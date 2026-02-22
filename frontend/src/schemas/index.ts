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

export const ForgotPasswordSchema = z.object({
  email: z
    .email({ message: "Email no válido" })
    .min(1, { message: "El Email es Obligatorio" }),
});

export const ResetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, { message: "La constraseña es muy corta, mínimo 8 caracteres" }),
    password_confirmation: z.string(),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Las constraseñas no son iguales",
    path: ["password_confirmation"],
  });

export const DraftBudgetSchema = z.object({
  name: z
    .string()
    .min(1, { message: "El Nombre del presupuesto es obligatorio" }),
  amount: z.coerce
    .number({ message: "Cantidad no válida" })
    .min(1, { message: "Cantidad no válida" }),
});

export const SuccessSchema = z.string();
export const ErrorResponseSchema = z.object({
  error: z.string(),
});

export const UserSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.email(),
});

export const BudgetAPIResponseSchema = z.object({
  id: z.number(),
  name: z.string(),
  amount: z.string(),
  userId: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export const BudgetsAPIResponseSchema = z.array(BudgetAPIResponseSchema);

export type User = z.infer<typeof UserSchema>;
export type Budget = z.infer<typeof BudgetAPIResponseSchema>;
