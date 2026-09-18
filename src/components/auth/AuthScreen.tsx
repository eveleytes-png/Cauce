"use client";

import { useState } from "react";

import { LoginForm } from "@/components/auth/LoginForm";
import { RegisterForm } from "@/components/auth/RegisterForm";
import type { AuthSession } from "@/lib/auth-storage";

type AuthScreenProps = {
  onAuthenticated: (session: AuthSession) => void;
};

export function AuthScreen({ onAuthenticated }: AuthScreenProps) {
  const [mode, setMode] = useState<"login" | "register">("login");

  return (
    <div className="cauce-app auth-app">
      <main className="auth-wrap">
        <section className="surface auth-card">
          <div className="auth-card-banner">
            <img src="/logo-cauce.png" alt="CAUCE" />
          </div>
          <div className="auth-card-body">
            {mode === "login" ? (
              <LoginForm
                onAuthenticated={onAuthenticated}
                onGoToRegister={() => setMode("register")}
              />
            ) : (
              <RegisterForm onGoToLogin={() => setMode("login")} />
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
