import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { RequireAuth } from "@/components/RequireAuth";
import { PageTitle } from "@/components/SiteLayout";
import { BOOKING_RULES, timeSlots } from "@/lib/restaurant";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/reserve")({
  head: () => ({
    meta: [
      { title: "Reserve a Table — Saffron Table" },
      { name: "description", content: "Check live seat availability and book a table at Saffron Table." },
      { property: "og:title", content: "Reserve a Table — Saffron Table" },
      { property: "og:description", content: "Check availability and book a table." },
    ],
  }),
  component: () => <RequireAuth><ReserveForm /></RequireAuth>,
});

const schema = z.object({
  customer_name: z.string().trim().min(2, "Enter your name").max(100),
  phone: z.string().trim().regex(/^[+0-9 ()-]{7,20}$/, "Enter a valid phone number"),
  email: z.string().trim().email("Enter a valid email").max(255),
  reservation_date: z.string().min(1, "Choose a date"),
  reservation_time: z.string().min(1, "Choose a time"),
  guests: z.number().int().min(1).max(BOOKING_RULES.maxGuests, `Maximum ${BOOKING_RULES.maxGuests} guests online`),
  special_request: z.string().trim().max(500).optional(),
});

// Today's date in India, as YYYY-MM-DD
const todayIST = () => new Date(Date.now() + 5.5 * 3600e3).toISOString().slice(0, 10);
const nowMinutesIST = () => { const d = new Date(Date.now() + 5.5 * 3600e3); return d.getUTCHours() * 60 + d.getUTCMinutes(); };

function ReserveForm() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    customer_name: (user?.user_metadata?.full_name as string) ?? "",
    phone: "", email: user?.email ?? "",
    reservation_date: "", reservation_time: "", guests: 2, special_request: "",
  });
  const [freeSeats, setFreeSeats] = useState<Record<string, number>>({});
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const set = (k: keyof typeof form, v: string | number) => setForm((f) => ({ ...f, [k]: v }));

  // When the date changes, ask the database how many seats are free in each slot.
  useEffect(() => {
    if (!form.reservation_date) return;
    let cancelled = false;
    setChecking(true);
    Promise.all(
      timeSlots().map(async (t) => {
        const { data } = await supabase.rpc("seats_taken", { _date: form.reservation_date, _time: t });
        return [t, BOOKING_RULES.totalSeats - (data ?? 0)] as const;
      }),
    ).then((rows) => { if (!cancelled) { setFreeSeats(Object.fromEntries(rows)); setChecking(false); } });
    return () => { cancelled = true; };
  }, [form.reservation_date]);

  const isPastSlot = (t: string) => {
    if (form.reservation_date !== todayIST()) return false;
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m <= nowMinutesIST();
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    const parsed = schema.safeParse(form);
    if (!parsed.success) { setError(parsed.error.issues[0].message); return; }
    setBusy(true);
    // The database re-checks hours, past dates and seat capacity before saving.
    const { error } = await supabase.from("reservations").insert({
      ...parsed.data, special_request: parsed.data.special_request || null, user_id: user!.id,
    });
    setBusy(false);
    if (error) { setError(error.message); return; }
    toast.success("Reservation requested! We'll confirm it shortly.");
    navigate({ to: "/bookings" });
  };

  const maxDate = new Date(Date.now() + BOOKING_RULES.maxDaysAhead * 864e5).toISOString().slice(0, 10);

  return (
    <div className="mx-auto max-w-3xl px-5 py-12">
      <PageTitle title="Reserve a Table" subtitle={`Bookings from ${BOOKING_RULES.firstSlot} to ${BOOKING_RULES.lastSlot}. Each table is held for 2 hours.`} />
      <form onSubmit={submit} noValidate className="space-y-6 rounded-lg border bg-card p-6 md:p-8">
        <div className="grid gap-4 md:grid-cols-3">
          <div><Label htmlFor="n">Name</Label><Input id="n" value={form.customer_name} onChange={(e) => set("customer_name", e.target.value)} maxLength={100} /></div>
          <div><Label htmlFor="p">Phone</Label><Input id="p" value={form.phone} onChange={(e) => set("phone", e.target.value)} maxLength={20} placeholder="+91 98765 43210" /></div>
          <div><Label htmlFor="e">Email</Label><Input id="e" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} maxLength={255} /></div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div><Label htmlFor="d">Date</Label><Input id="d" type="date" min={todayIST()} max={maxDate} value={form.reservation_date} onChange={(e) => { set("reservation_date", e.target.value); set("reservation_time", ""); }} /></div>
          <div><Label htmlFor="g">Guests</Label><Input id="g" type="number" min={1} max={BOOKING_RULES.maxGuests} value={form.guests} onChange={(e) => set("guests", Number(e.target.value))} /></div>
        </div>

        <div>
          <Label>Time</Label>
          {!form.reservation_date ? (
            <p className="mt-2 text-sm text-muted-foreground">Pick a date to see available times.</p>
          ) : checking ? (
            <p className="mt-2 text-sm text-muted-foreground">Checking availability…</p>
          ) : (
            <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-6">
              {timeSlots().map((t) => {
                const free = freeSeats[t] ?? 0;
                const disabled = isPastSlot(t) || free < form.guests;
                const selected = form.reservation_time === t;
                return (
                  <button type="button" key={t} disabled={disabled} onClick={() => set("reservation_time", t)}
                    className={`rounded-md border px-2 py-2 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${selected ? "border-primary bg-primary text-primary-foreground" : "hover:border-primary"}`}>
                    <span className="block font-semibold">{t}</span>
                    <span className="block text-xs opacity-80">{isPastSlot(t) ? "passed" : `${Math.max(free, 0)} seats`}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div><Label htmlFor="s">Special request (optional)</Label><Textarea id="s" value={form.special_request} onChange={(e) => set("special_request", e.target.value)} maxLength={500} placeholder="Birthday, high chair, allergies…" /></div>
        {error && <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
        <Button type="submit" size="lg" disabled={busy}>{busy ? "Booking…" : "Submit reservation"}</Button>
      </form>
    </div>
  );
}
