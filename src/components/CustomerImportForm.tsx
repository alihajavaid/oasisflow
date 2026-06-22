"use client";

import { useActionState } from "react";
import { importCustomers, type ImportState } from "@/lib/actions/admin/import";

const initialState: ImportState = {};

export function CustomerImportForm() {
  const [state, action, pending] = useActionState(importCustomers, initialState);

  return (
    <div className="flex flex-col gap-6">
      <form action={action} encType="multipart/form-data" className="card flex flex-col gap-3 p-5">
        <label className="label" htmlFor="file">Excel file (.xlsx)</label>
        <input className="input" id="file" name="file" type="file" accept=".xlsx" required />
        {state.error && <p className="text-sm text-red-600">{state.error}</p>}
        <button type="submit" disabled={pending} className="btn-primary self-start">
          {pending ? "Importing..." : "Import Customers"}
        </button>
      </form>

      {state.results && (
        <div className="card p-5">
          <h3 className="mb-3 font-semibold text-brand-900">
            Import Results &mdash; {state.results.filter((r) => r.status !== "error").length} succeeded,{" "}
            {state.results.filter((r) => r.status === "error").length} failed
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-brand-700">
                  <th className="p-2">Row</th>
                  <th className="p-2">Name</th>
                  <th className="p-2">Email</th>
                  <th className="p-2">Status</th>
                  <th className="p-2">Coupon Book</th>
                  <th className="p-2">Temp Password</th>
                  <th className="p-2">Notes</th>
                </tr>
              </thead>
              <tbody>
                {state.results.map((r) => (
                  <tr key={r.row} className="border-t border-brand-100">
                    <td className="p-2">{r.row}</td>
                    <td className="p-2">{r.name}</td>
                    <td className="p-2">{r.email}</td>
                    <td className="p-2">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          r.status === "error" ? "bg-red-100 text-red-700" : "bg-accent/10 text-accent"
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="p-2">{r.couponBook ?? "-"}</td>
                    <td className="p-2 font-mono text-xs">{r.tempPassword ?? "-"}</td>
                    <td className="p-2 text-xs text-brand-700">{r.message ?? ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-brand-700">
            New customers got a temp password shown above &mdash; use Bulk WhatsApp to send each of them their
            login email and temp password so they can log in and change it.
          </p>
        </div>
      )}
    </div>
  );
}
