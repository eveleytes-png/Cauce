export type RegisteredUser = {
  id: string;
  fullName: string;
  email: string;
  password: string;
  createdAt: string;
};

export type AuthSession = {
  isAuthenticated: true;
  email: string;
  fullName: string;
};

export const USERS_STORAGE_KEY = "cauce.users";
export const SESSION_STORAGE_KEY = "cauce.session";

function canUseStorage() {
  return typeof window !== "undefined";
}

function isRegisteredUser(value: unknown): value is RegisteredUser {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.id === "string" &&
    typeof record.fullName === "string" &&
    typeof record.email === "string" &&
    typeof record.password === "string" &&
    typeof record.createdAt === "string"
  );
}

function isAuthSession(value: unknown): value is AuthSession {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  return (
    record.isAuthenticated === true &&
    typeof record.email === "string" &&
    typeof record.fullName === "string"
  );
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function parseUsers(raw: string | null): RegisteredUser[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isRegisteredUser);
  } catch {
    return [];
  }
}

export function readUsers(): RegisteredUser[] {
  if (!canUseStorage()) return [];
  return parseUsers(window.localStorage.getItem(USERS_STORAGE_KEY));
}

export function writeUsers(users: RegisteredUser[]) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
}

export function findUserByEmail(email: string) {
  const normalized = normalizeEmail(email);
  return readUsers().find((user) => normalizeEmail(user.email) === normalized) ?? null;
}

export function addUser(input: { fullName: string; email: string; password: string }) {
  const users = readUsers();
  const email = normalizeEmail(input.email);
  if (users.some((user) => normalizeEmail(user.email) === email)) {
    return { ok: false as const, reason: "duplicate" as const, users };
  }

  const next: RegisteredUser = {
    id: `usr-${Date.now()}`,
    fullName: input.fullName.trim(),
    email,
    password: input.password,
    createdAt: new Date().toISOString(),
  };
  const updated = [...users, next];
  writeUsers(updated);
  return { ok: true as const, user: next, users: updated };
}

export function authenticateUser(email: string, password: string) {
  const user = findUserByEmail(email);
  if (!user || user.password !== password) {
    return null;
  }
  return {
    isAuthenticated: true as const,
    email: user.email,
    fullName: user.fullName,
  };
}

export function readSession(): AuthSession | null {
  if (!canUseStorage()) return null;
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(SESSION_STORAGE_KEY) ?? "null");
    return isAuthSession(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function writeSession(session: AuthSession) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
}

export function clearSession() {
  if (!canUseStorage()) return;
  window.localStorage.removeItem(SESSION_STORAGE_KEY);
}

export function wait(ms: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms);
  });
}
