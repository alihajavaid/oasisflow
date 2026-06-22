import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { FeedbackForm } from "@/components/FeedbackForm";

export const dynamic = "force-dynamic";

export default async function FeedbackPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const feedback = await prisma.feedback.findMany({ where: { customerId: user.id }, orderBy: { createdAt: "desc" } });

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <FeedbackForm />
      <div>
        <h2 className="mb-4 text-lg font-semibold text-brand-900">Your Past Feedback</h2>
        <div className="flex flex-col gap-3">
          {feedback.length === 0 && <p className="text-sm text-brand-700">You haven&apos;t left any feedback yet.</p>}
          {feedback.map((f) => (
            <div key={f.id} className="card p-4 text-sm">
              <p className="font-medium text-brand-900">{"★".repeat(f.rating)}{"☆".repeat(5 - f.rating)}</p>
              <p className="mt-1 text-brand-700">{f.message}</p>
              {f.response && <p className="mt-2 rounded bg-brand-50 p-2 text-brand-900"><strong>OasisFlow:</strong> {f.response}</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
