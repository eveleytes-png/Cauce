"use client";

import { useState, type FormEvent } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";

import { PASSWORD_RULES, registerSchema, type RegisterFormValues } from "@/lib/auth-schemas";
import { addUser, wait } from "@/lib/auth-storage";

type RegisterFormProps = {
  onGoToLogin: () => void;
};

const defaultValues: RegisterFormValues = {
  fullName: "",
  email: "",
  password: "",
  confirmPassword: "",
  terms: false,
};

export function RegisterForm({ onGoToLogin }: RegisterFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [formAlerts, setFormAlerts] = useState<{ id: string; message: string }[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isValid },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues,
  });

  const submitDisabled = !isValid || isSubmitting;

  const onValidSubmit = async (values: RegisterFormValues) => {
    setFormAlerts([]);
    setSuccessMessage("");
    await wait(1000);
    const result = addUser({
      fullName: values.fullName,
      email: values.email,
      password: values.password,
    });

    if (!result.ok) {
      setFormAlerts([
        {
          id: "duplicate-email",
          message: "Ya existe una cuenta con ese correo. Iniciá sesión o usá otro email.",
        },
      ]);
      return;
    }

    reset(defaultValues);
    setSuccessMessage("Cuenta creada. Ya podés iniciar sesión.");
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void handleSubmit(onValidSubmit)(event);
  };

  return (
    <form className="auth-form" onSubmit={onSubmit} noValidate>
      <div>
        <span className="eyebrow">Cuenta</span>
        <h1>Crear cuenta</h1>
        <p className="page-subtitle">Completá tus datos para registrarte en CAUCE.</p>
      </div>

      {formAlerts.map((alert) => (
        <p className="modal-alert" key={alert.id} role="alert">
          {alert.message}
        </p>
      ))}
      {successMessage ? (
        <p className="modal-alert success" role="status">
          {successMessage}
        </p>
      ) : null}

      <label>
        Nombre completo
        <input
          type="text"
          autoComplete="name"
          placeholder="Nombre y apellido"
          disabled={isSubmitting}
          {...register("fullName")}
        />
        {errors.fullName ? <span className="field-error">{errors.fullName.message}</span> : null}
      </label>

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

      <div>
        <label>
          Contraseña
          <span className="password-field">
            <input
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Mínimo 8 caracteres"
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
        <ul className="password-hints">
          {PASSWORD_RULES.map((rule) => (
            <li key={rule.id}>{rule.message}</li>
          ))}
        </ul>
      </div>

      <label>
        Confirmar contraseña
        <span className="password-field">
          <input
            type={showConfirm ? "text" : "password"}
            autoComplete="new-password"
            placeholder="Repetí la contraseña"
            disabled={isSubmitting}
            {...register("confirmPassword")}
          />
          <button
            type="button"
            className="password-toggle"
            aria-label={showConfirm ? "Ocultar confirmación" : "Mostrar confirmación"}
            onClick={() => setShowConfirm((value) => !value)}
          >
            {showConfirm ? <EyeOff /> : <Eye />}
          </button>
        </span>
        {errors.confirmPassword ? (
          <span className="field-error">{errors.confirmPassword.message}</span>
        ) : null}
      </label>

      <label className="checkbox-field">
        <input type="checkbox" disabled={isSubmitting} {...register("terms")} />
        <span>Acepto los términos y condiciones</span>
      </label>
      {errors.terms ? <span className="field-error">{errors.terms.message}</span> : null}

      <button className="primary-button" type="submit" disabled={submitDisabled}>
        {isSubmitting ? "Guardando…" : "Crear cuenta"}
      </button>

      <p className="auth-switch">
        ¿Ya tenés cuenta?{" "}
        <button type="button" className="link-button" onClick={onGoToLogin} disabled={isSubmitting}>
          Iniciar sesión
        </button>
      </p>
    </form>
  );
}
