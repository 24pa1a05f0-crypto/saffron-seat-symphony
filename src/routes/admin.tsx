import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Database, Tables } from "@/integrations/supabase/types";
import { RequireAuth } from "@/components/RequireAuth";
import { PageTitle, StatusBadge } from "@/components/SiteLayout";
import { Input } from "@/components/ui/input";
import { formatDate } from "@/lib/restaurant";

type Status = Database["public"]["Enums"]["reservation_status"];

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard — Saffron Table" },
      { name: "description", content: "Staff dashboard for managing reservations." },
      { property: "og:title", content: "Admin Dashboard — Saffron Table" },
      { property: "og:description", content: "Manage reservations." },
    ],
  }),
  component: () => <RequireAuth adminOnly><Admin /></RequireAuth>,
});

function Admin() {
  const [rows, setRows] = useState<Tables<"reservations">[] | null>(null);
  const [date, setDate] = useState("");
  const [filter, setFilter] = useState<Status | "all">("all");

  const load = useCallback(async () => {
    let q = supabase.from("reservations").select("*").order("reservation_date").order("reservation_time");
    if (date) q = q.eq("reservation_date", date);
    if (filter !== "all") q = q.eq("status", filter);
    const { data, error } = await q;
    if (error) toast.error(error.message);
    setRows(data ?? []);
  }, [date, filter]);

  useEffect(() => { load(); }, [load]);

  const updateStatus = async (id: string, status: Status) => {
    const { error } = await supabase.from("reservations").update({ status }).eq("id", id);
    if (error) toast.error(error.message); else { toast.success(`Marked ${status}`); load(); }
  };

  const counts = { total: rows?.length ?? 0, pending: rows?.filter((r) => r.status === "pending").length ?? 0, guests: rows?.filter((r) => r.status !== "cancelled").reduce((s, r) => s + r.guests, 0) ?? 0 };

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <PageTitle title="Admin Dashboard" subtitle="All reservations. Confirm or cancel bookings below." />
      <div className="mb-6 flex flex-wrap items-end gap-4">
        <div><label className="text-sm font-medium">Date</label><Input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div>
        <div>
          <label className="text-sm font-medium">Status</label>
          <select value={filter} onChange={(e) => setFilter(e.target.value as Status | "all")} className="block h-9 rounded-md border bg-card px-3 text-sm">
            <option value="all">All</option><option value="pending">Pending</option><option value="confirmed">Confirmed</option><option value="cancelled">Cancelled</option>
          </select>
        </div>
        {date && <button className="text-sm text-primary" onClick={() => setDate("")}>Clear date</button>}
        <p className="ml-auto text-sm text-muted-foreground">{counts.total} bookings · {counts.pending} pending · {counts.guests} guests expected</p>
      </div>

      {rows === null ? <p className="text-muted-foreground">Loading…</p> : rows.length === 0 ? <p className="text-muted-foreground">No reservations match.</p> : (
        <div className="overflow-x-auto rounded-lg border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-muted text-left"><tr>
              <th className="p-3">When</th><th className="p-3">Customer</th><th className="p-3">Guests</th><th className="p-3">Request</th><th className="p-3">Status</th><th className="p-3">Actions</th>
            </tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t align-top">
                  <td className="p-3 whitespace-nowrap">{formatDate(r.reservation_date)}<br /><span className="font-semibold">{r.reservation_time.slice(0, 5)}</span></td>
                  <td className="p-3">{r.customer_name}<br /><span className="text-muted-foreground">{r.phone} · {r.email}</span></td>
                  <td className="p-3">{r.guests}</td>
                  <td className="p-3 max-w-xs text-muted-foreground">{r.special_request || "—"}</td>
                  <td className="p-3"><StatusBadge status={r.status} /></td>
                  <td className="p-3 whitespace-nowrap space-x-3">
                    {r.status !== "confirmed" && <button className="font-semibold text-success hover:underline" onClick={() => updateStatus(r.id, "confirmed")}>Confirm</button>}
                    {r.status !== "cancelled" && <button className="font-semibold text-destructive hover:underline" onClick={() => updateStatus(r.id, "cancelled")}>Cancel</button>}
                    {r.status !== "pending" && <button className="text-muted-foreground hover:underline" onClick={() => updateStatus(r.id, "pending")}>Set pending</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
