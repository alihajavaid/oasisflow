"use client";

import { useMemo, useState } from "react";

export type WhatsAppCustomer = { id: string; name: string; phone: string | null; area: string | null };

function toWhatsAppNumber(phone: string) {
  const digits = phone.replace(/[^\d]/g, "");
  if (digits.startsWith("0")) return `971${digits.slice(1)}`; // UAE local format -> international
  return digits;
}

export function BulkWhatsAppComposer({ customers }: { customers: WhatsAppCustomer[] }) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [message, setMessage] = useState("Hi {{name}}, this is OasisFlow Water. ");
  const [generated, setGenerated] = useState<{ id: string; name: string; url: string }[] | null>(null);

  const withPhone = useMemo(() => customers.filter((c) => c.phone), [customers]);
  const filtered = useMemo(
    () => withPhone.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()) || (c.area ?? "").toLowerCase().includes(search.toLowerCase())),
    [withPhone, search]
  );

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function selectAllFiltered() {
    setSelected(new Set(filtered.map((c) => c.id)));
  }

  function clearSelection() {
    setSelected(new Set());
  }

  function generateLinks() {
    const links = withPhone
      .filter((c) => selected.has(c.id))
      .map((c) => {
        const personalized = message.replaceAll("{{name}}", c.name.split(" ")[0]);
        const number = toWhatsAppNumber(c.phone!);
        return { id: c.id, name: c.name, url: `https://wa.me/${number}?text=${encodeURIComponent(personalized)}` };
      });
    setGenerated(links);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="card p-5">
        <label className="label" htmlFor="message">Message (use {"{{name}}"} to personalize)</label>
        <textarea
          id="message"
          className="input"
          rows={3}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </div>

      <div className="card p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <input
            className="input max-w-xs"
            placeholder="Search by name or area..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="flex gap-2">
            <button type="button" onClick={selectAllFiltered} className="btn-secondary px-3 py-1.5 text-xs">
              Select all shown ({filtered.length})
            </button>
            <button type="button" onClick={clearSelection} className="btn-secondary px-3 py-1.5 text-xs">
              Clear selection
            </button>
          </div>
        </div>

        <div className="flex max-h-72 flex-col gap-1 overflow-y-auto rounded-lg border border-brand-100 p-2">
          {filtered.map((c) => (
            <label key={c.id} className="flex items-center gap-3 rounded px-2 py-1.5 text-sm hover:bg-brand-50">
              <input type="checkbox" checked={selected.has(c.id)} onChange={() => toggle(c.id)} />
              <span>{c.name}</span>
              <span className="text-xs text-brand-700">{c.phone}</span>
              {c.area && <span className="text-xs text-brand-500">[{c.area}]</span>}
            </label>
          ))}
          {filtered.length === 0 && <p className="p-2 text-sm text-brand-700">No customers match.</p>}
        </div>

        <p className="mt-3 text-sm text-brand-700">{selected.size} customer(s) selected.</p>
        <button type="button" onClick={generateLinks} disabled={selected.size === 0} className="btn-primary mt-2">
          Generate WhatsApp Links
        </button>
      </div>

      {generated && (
        <div className="card p-5">
          <h3 className="mb-1 font-semibold text-brand-900">Send Messages</h3>
          <p className="mb-3 text-xs text-brand-700">
            WhatsApp doesn&apos;t allow true one-click mass sending without the paid WhatsApp Business API — click
            each button below to open a pre-filled chat, then hit send in WhatsApp. Your browser may block several
            popups opening at once; if so, click them one at a time.
          </p>
          <div className="flex flex-col gap-2">
            {generated.map((g) => (
              <a
                key={g.id}
                href={g.url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary justify-between"
              >
                <span>Send to {g.name}</span>
                <span>WhatsApp ↗</span>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
