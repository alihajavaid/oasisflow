"use client";

import { useActionState } from "react";
import type { AuthFormState } from "@/lib/actions/auth";

type Field = { name: string; label: string; type?: string; placeholder?: string };

export function AuthForm({
  action,
  fields,
  submitLabel,
}: {
  action: (prev: AuthFormState, formData: FormData) => Promise<AuthFormState>;
  fields: Field[];
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction} className="card flex flex-col gap-4 p-6">
      {fields.map((f) => (
        <div key={f.name}>
          <label className="label" htmlFor={f.name}>{f.label}</label>
          <input className="input" id={f.name} name={f.name} type={f.type ?? "text"} placeholder={f.placeholder} required />
        </div>
      ))}
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      <button type="submit" disabled={pending} className="btn-primary">
        {pending ? "Please wait..." : submitLabel}
      </button>
    </form>
  );
}
