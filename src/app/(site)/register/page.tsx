import Link from "next/link";
import { AuthForm } from "@/components/AuthForm";
import { registerCustomer } from "@/lib/actions/auth";

export default function RegisterPage() {
  return (
    <div className="container-page flex justify-center py-16">
      <div className="w-full max-w-md">
        <h1 className="mb-6 text-center text-2xl font-bold text-brand-900">Create your account</h1>
        <AuthForm
          action={registerCustomer}
          submitLabel="Register"
          fields={[
            { name: "name", label: "Full Name", placeholder: "Your name" },
            { name: "email", label: "Email", type: "email", placeholder: "you@example.com" },
            { name: "phone", label: "Phone", type: "tel", placeholder: "05XXXXXXXX" },
            { name: "address", label: "Delivery Address", placeholder: "Villa / Street / Area, Abu Dhabi" },
            { name: "password", label: "Password", type: "password", placeholder: "At least 6 characters" },
          ]}
        />
        <p className="mt-4 text-center text-sm text-brand-700">
          Already have an account? <Link href="/login" className="font-semibold text-brand-500">Login</Link>
        </p>
      </div>
    </div>
  );
}
