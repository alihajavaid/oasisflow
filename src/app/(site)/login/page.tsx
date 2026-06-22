import Link from "next/link";
import { AuthForm } from "@/components/AuthForm";
import { login } from "@/lib/actions/auth";

export default function LoginPage() {
  return (
    <div className="container-page flex justify-center py-16">
      <div className="w-full max-w-md">
        <h1 className="mb-6 text-center text-2xl font-bold text-brand-900">Login to OasisFlow</h1>
        <AuthForm
          action={login}
          submitLabel="Login"
          fields={[
            { name: "email", label: "Email", type: "email", placeholder: "you@example.com" },
            { name: "password", label: "Password", type: "password", placeholder: "••••••••" },
          ]}
        />
        <p className="mt-4 text-center text-sm text-brand-700">
          New to OasisFlow? <Link href="/register" className="font-semibold text-brand-500">Create an account</Link>
        </p>
        <p className="mt-2 text-center text-xs text-brand-700">
          Admin / driver accounts: use the credentials provided by OasisFlow management.
        </p>
      </div>
    </div>
  );
}
