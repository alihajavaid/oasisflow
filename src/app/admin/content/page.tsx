import { prisma } from "@/lib/prisma";
import { updateContentBlock } from "@/lib/actions/admin/content";

export const dynamic = "force-dynamic";

const editableKeys = [
  { key: "hero_title", label: "Hero Title", multiline: false },
  { key: "hero_subtitle", label: "Hero Subtitle", multiline: true },
  { key: "hero_image", label: "Hero Image URL", multiline: false },
  { key: "why_choose_intro", label: "\"Why Choose Us\" Intro", multiline: true },
  { key: "about_text", label: "About Us Text", multiline: true },
  { key: "contact_address", label: "Contact Address", multiline: false },
  { key: "contact_phone", label: "Contact Phone", multiline: false },
  { key: "contact_whatsapp", label: "WhatsApp Number (digits only)", multiline: false },
  { key: "contact_email", label: "Contact Email", multiline: false },
];

export default async function AdminContentPage() {
  const blocks = await prisma.contentBlock.findMany();
  const map = Object.fromEntries(blocks.map((b) => [b.key, b.value]));

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-brand-900">Website Content</h1>
      <p className="mb-6 text-sm text-brand-700">
        Edit the text shown on the public website. Images still load from oasisflowwater.com; paste a new URL to
        change them.
      </p>
      <div className="grid gap-4 md:grid-cols-2">
        {editableKeys.map((field) => (
          <form key={field.key} action={updateContentBlock} className="card flex flex-col gap-2 p-4">
            <input type="hidden" name="key" value={field.key} />
            <label className="label">{field.label}</label>
            {field.multiline ? (
              <textarea className="input" name="value" rows={3} defaultValue={map[field.key] ?? ""} />
            ) : (
              <input className="input" name="value" defaultValue={map[field.key] ?? ""} />
            )}
            <button type="submit" className="btn-primary mt-1 self-start">Save</button>
          </form>
        ))}
      </div>
    </div>
  );
}
