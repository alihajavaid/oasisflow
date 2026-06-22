"use client";

import { useActionState } from "react";
import { submitFeedback, type FeedbackFormState } from "@/lib/actions/feedback";

const initialState: FeedbackFormState = {};

export function FeedbackForm() {
  const [state, action, pending] = useActionState(submitFeedback, initialState);

  return (
    <form action={action} className="card flex flex-col gap-4 p-6">
      <div>
        <label className="label" htmlFor="rating">Rating</label>
        <select className="input" id="rating" name="rating" defaultValue={5}>
          {[5, 4, 3, 2, 1].map((n) => (
            <option key={n} value={n}>{"★".repeat(n)}{"☆".repeat(5 - n)}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="label" htmlFor="message">Your Feedback</label>
        <textarea className="input" id="message" name="message" rows={4} placeholder="Tell us about your experience" required />
      </div>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state.ok && <p className="text-sm text-accent">Thank you for your feedback!</p>}
      <button type="submit" disabled={pending} className="btn-primary">
        {pending ? "Submitting..." : "Submit Feedback"}
      </button>
    </form>
  );
}
