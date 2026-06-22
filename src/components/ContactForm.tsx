"use client";

import { useActionState } from "react";
import { submitContactMessage, type ContactFormState } from "@/lib/actions/contact";

const initialState: ContactFormState = { ok: false, message: "" };

export function ContactForm() {
  const [state, action, pending] = useActionState(submitContactMessage, initialState);

  return (
    <form action={action} className="card flex flex-col gap-4 p-6">
      <div>
        <label className="label" htmlFor="name">Your Name</label>
        <input className="input" id="name" name="name" placeholder="Enter your name" required />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="phone">Your Phone</label>
          <input className="input" id="phone" name="phone" type="tel" placeholder="Enter your phone" required />
        </div>
        <div>
          <label className="label" htmlFor="email">Your Email</label>
          <input className="input" id="email" name="email" type="email" placeholder="Enter your email" required />
        </div>
      </div>
      <div>
        <label className="label" htmlFor="message">Message</label>
        <textarea className="input" id="message" name="message" rows={5} placeholder="Type your message" required />
      </div>
      <button type="submit" disabled={pending} className="btn-primary">
        {pending ? "Sending..." : "Send Message"}
      </button>
      {state.message && (
        <p className={state.ok ? "text-sm text-accent" : "text-sm text-red-600"}>{state.message}</p>
      )}
    </form>
  );
}
