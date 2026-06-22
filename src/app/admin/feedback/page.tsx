import { prisma } from "@/lib/prisma";
import { respondToFeedback, markContactHandled } from "@/lib/actions/admin/feedback";

export const dynamic = "force-dynamic";

export default async function AdminFeedbackPage() {
  const [feedback, messages] = await Promise.all([
    prisma.feedback.findMany({ include: { customer: true }, orderBy: { createdAt: "desc" } }),
    prisma.contactMessage.findMany({ where: { handled: false }, orderBy: { createdAt: "desc" } }),
  ]);

  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="mb-6 text-2xl font-bold text-brand-900">Customer Feedback</h1>
        <div className="flex flex-col gap-4">
          {feedback.map((f) => (
            <div key={f.id} className="card p-5">
              <p className="font-medium text-brand-900">{f.customer.name} &mdash; {"★".repeat(f.rating)}{"☆".repeat(5 - f.rating)}</p>
              <p className="mt-1 text-sm text-brand-700">{f.message}</p>
              {f.response ? (
                <p className="mt-2 rounded bg-brand-50 p-2 text-sm text-brand-900"><strong>Your reply:</strong> {f.response}</p>
              ) : (
                <form action={respondToFeedback} className="mt-3 flex gap-2">
                  <input type="hidden" name="id" value={f.id} />
                  <input className="input" name="response" placeholder="Write a reply..." required />
                  <button type="submit" className="btn-primary px-4 py-2 text-sm">Reply</button>
                </form>
              )}
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="mb-6 text-xl font-bold text-brand-900">Contact Form Inbox</h2>
        <div className="flex flex-col gap-3">
          {messages.length === 0 && <p className="text-sm text-brand-700">No unread messages.</p>}
          {messages.map((m) => (
            <div key={m.id} className="card flex flex-wrap items-start justify-between gap-3 p-4">
              <div>
                <p className="font-medium text-brand-900">{m.name} &mdash; {m.email} / {m.phone}</p>
                <p className="mt-1 text-sm text-brand-700">{m.message}</p>
              </div>
              <form action={markContactHandled}>
                <input type="hidden" name="id" value={m.id} />
                <button type="submit" className="btn-secondary px-3 py-1 text-xs">Mark Handled</button>
              </form>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
