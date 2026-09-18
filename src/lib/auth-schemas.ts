import { z } from "zod";

export const PASSWORD_RULES = [
  { id: "length", message: "Mínimo 8 caracteres", test: (value: string) => value.length >= 8 },
  { id: "upper", message: "Al menos una mayúscula", test: (value: string) => /[A-Z]/.test(value) },
  { id: "number", message: "Al menos un número", test: (value: string) => /\d/.test(value) },
  {
    id: "special",
    message: "Al menos un carácter especial",
    test: (value: string) => /[^A-Za-z0-9]/.test(value),
  },
] as const;

export const passwordSchema = z
  .string()
  .min(1, "La contraseña es obligatoria")
  .min(8, "La contraseña debe tener al menos 8 caracteres")
  .regex(/[A-Z]/, "Incluí al menos una mayúscula")
  .regex(/\d/, "Incluí al menos un número")
  .regex(/[^A-Za-z0-9]/, "Incluí al menos un carácter especial");

export const emailSchema = z
  .string()
  .trim()
  .min(1, "El correo es obligatorio")
  .email("Ingresá un correo válido");

export const registerSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(1, "El nombre completo es obligatorio")
      .min(2, "Ingresá al menos 2 caracteres"),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Confirmá la contraseña"),
    terms: z.boolean().refine((value) => value, {
      message: "Tenés que aceptar los términos y condiciones",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Las contraseñas no coinciden",
  });

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "La contraseña es obligatoria"),
});

export type RegisterFormValues = z.infer<typeof registerSchema>;
export type LoginFormValues = z.infer<typeof loginSchema>;
