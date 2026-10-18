import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { useAuth } from "@/lib/auth";
import { RequireAuth } from "@/components/RequireAuth";
import { PageTitle, StatusBadge } from "@/components/SiteLayout";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/bookings")({
  head: () => ({
    meta: [
      { title: "My Bookings — Saffron Table" },
      { name: "description", content: "View and cancel your reservations at Saffron Table." },
      { property: "og:title", content: "My Bookings — Saffron Table" },
      { property: "og:description", content: "View and cancel your reservations." },
    ],
  }),
  component: () => <RequireAuth><Bookings /></RequireAuth>,
});

export const formatDate = (d: string) => new Date(d + "T00:00").toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" });

function Bookings() {
  const { user } = useAuth();
  const [rows, setRows] = useState<Tables<"reservations">[] | null>(null);

  const load = useCallback(async () => {
    // Only the user's own rows are returned (also enforced by database security rules).
    const { data } = await supabase.from("reservations").select("*").eq("user_id", user!.id)
      .order("reservation_date", { ascending: false }).order("reservation_time", { ascending: false });
    setRows(data ?? []);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const cancel = async (id: string) => {
    if (!confirm("Cancel this reservation?")) return;
    const { error } = await supabase.from("reservations").update({ status: "cancelled" }).eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Reservation cancelled"); load(); }
  };

  const isUpcoming = (r: Tables<"reservations">) => new Date(`${r.reservation_date}T${r.reservation_time}+05:30`) > new Date();

  return (
    <div className="mx-auto max-w-4xl px-5 py-12">
      <PageTitle title="My Bookings" />
      {rows === null ? <p className="text-muted-foreground">Loading…</p> : rows.length === 0 ? (
        <div className="rounded-lg border bg-card p-10 text-center">
          <p className="text-muted-foreground">You have no reservations yet.</p>
          <Link to="/reserve" className="mt-4 inline-flex rounded-md bg-primary px-5 py-2 font-medium text-primary-foreground">Reserve a table</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {rows.map((r) => (
            <div key={r.id} className="flex flex-wrap items-center justify-between gap-4 rounded-lg border bg-card p-5">
              <div>
                <p className="font-display text-lg font-semibold">{formatDate(r.reservation_date)} · {r.reservation_time.slice(0, 5)}</p>
                <p className="text-sm text-muted-foreground">{r.guests} guest{r.guests > 1 ? "s" : ""}{r.special_request ? ` · “${r.special_request}”` : ""}</p>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={r.status} />
                {r.status !== "cancelled" && isUpcoming(r) && <Button variant="outline" size="sm" onClick={() => cancel(r.id)}>Cancel</Button>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
