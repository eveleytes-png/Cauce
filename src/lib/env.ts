import { z } from "zod";

const clientSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url(),
  NEXT_PUBLIC_APP_NAME: z.string().min(1),
});

const serverSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]),
  // Add private secrets here. Never expose them with NEXT_PUBLIC_.
  // DATABASE_URL: z.string().url(),
  // AUTH_SECRET: z.string().min(32),
});

function formatZodError(error: z.ZodError) {
  return error.issues
    .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
    .join("\n");
}

function parseClientEnv() {
  const parsed = clientSchema.safeParse({
    NEXT_PUBLIC_APP_URL: "http://localhost:3000",
    NEXT_PUBLIC_APP_NAME: "CAUCE",
  });

  if (!parsed.success) {
    throw new Error(
      `Invalid public environment variables:\n${formatZodError(parsed.error)}\nCopy .env.example to .env.local and fill in the values.`,
    );
  }

  return parsed.data;
}

function parseServerEnv() {
  const parsed = serverSchema.safeParse({
    NODE_ENV: process.env.NODE_ENV,
  });

  if (!parsed.success) {
    throw new Error(
      `Invalid server environment variables:\n${formatZodError(parsed.error)}`,
    );
  }

  return parsed.data;
}

const clientEnv = parseClientEnv();

/**
 * Validated environment variables.
 * Import this from Server Components, Route Handlers, and Server Actions.
 * Only NEXT_PUBLIC_* keys are safe to use in Client Components.
 */
export const env =
  typeof window === "undefined"
    ? { ...parseServerEnv(), ...clientEnv }
    : clientEnv;

export type ClientEnv = z.infer<typeof clientSchema>;
export type ServerEnv = z.infer<typeof serverSchema> & ClientEnv;
