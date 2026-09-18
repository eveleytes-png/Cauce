"use client";

import { useState, type FormEvent } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";

import { loginSchema, type LoginFormValues } from "@/lib/auth-schemas";
import { authenticateUser, wait, type AuthSession } from "@/lib/auth-storage";

type LoginFormProps = {
  onAuthenticated: (session: AuthSession) => void;
  onGoToRegister: () => void;
};

const defaultValues: LoginFormValues = {
  email: "",
  password: "",
};

export function LoginForm({ onAuthenticated, onGoToRegister }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [formAlerts, setFormAlerts] = useState<{ id: string; message: string }[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues,
  });

  const submitDisabled = !isValid || isSubmitting;

  const onValidSubmit = async (values: LoginFormValues) => {
    setFormAlerts([]);
    await wait(1000);
    const session = authenticateUser(values.email, values.password);
    if (!session) {
      setFormAlerts([
        {
          id: "invalid-credentials",
          message: "El correo o la contraseña no coinciden. Revisá los datos e intentá de nuevo.",
        },
      ]);
      return;
    }
    onAuthenticated(session);
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void handleSubmit(onValidSubmit)(event);
  };

  return (
    <form className="auth-form" onSubmit={onSubmit} noValidate>
      <div>
        <h1>Iniciar sesión</h1>
        <p className="page-subtitle">Ingresá con la cuenta que registraste en este dispositivo.</p>
      </div>

      {formAlerts.map((alert) => (
        <p className="modal-alert" key={alert.id} role="alert">
          {alert.message}
        </p>
      ))}

      <label>
        Correo electrónico
        <input
          type="email"
          autoComplete="email"
          placeholder="mail@empresa.com"
          disabled={isSubmitting}
          {...register("email")}
        />
        {errors.email ? <span className="field-error">{errors.email.message}</span> : null}
      </label>

      <label>
        Contraseña
        <span className="password-field">
          <input
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="Tu contraseña"
            disabled={isSubmitting}
            {...register("password")}
          />
          <button
            type="button"
            className="password-toggle"
            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            onClick={() => setShowPassword((value) => !value)}
          >
            {showPassword ? <EyeOff /> : <Eye />}
          </button>
        </span>
        {errors.password ? <span className="field-error">{errors.password.message}</span> : null}
      </label>

      <button className="primary-button" type="submit" disabled={submitDisabled}>
        {isSubmitting ? "Verificando…" : "Iniciar sesión"}
      </button>

      <p className="auth-switch">
        ¿No tenés cuenta?{" "}
        <button type="button" className="link-button" onClick={onGoToRegister} disabled={isSubmitting}>
          Crear cuenta
        </button>
      </p>
    </form>
  );
}
