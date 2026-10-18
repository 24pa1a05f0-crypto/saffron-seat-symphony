import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { RESTAURANT } from "@/lib/restaurant";

const linkCls = "text-sm font-medium text-foreground/80 hover:text-primary transition-colors";
const activeProps = { className: "text-primary" };

export function SiteHeader() {
  const { user, isAdmin, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const links = (
    <>
      <Link to="/" className={linkCls} activeProps={activeProps} activeOptions={{ exact: true }} onClick={() => setOpen(false)}>Home</Link>
      <Link to="/menu" className={linkCls} activeProps={activeProps} onClick={() => setOpen(false)}>Menu</Link>
      <Link to="/reserve" className={linkCls} activeProps={activeProps} onClick={() => setOpen(false)}>Reservations</Link>
      <Link to="/bookings" className={linkCls} activeProps={activeProps} onClick={() => setOpen(false)}>My Bookings</Link>
      {isAdmin && <Link to="/admin" className={linkCls} activeProps={activeProps} onClick={() => setOpen(false)}>Admin</Link>}
      {user ? (
        <button className={linkCls + " text-left"} onClick={async () => { await signOut(); setOpen(false); navigate({ to: "/" }); }}>Log out</button>
      ) : (
        <>
          <Link to="/login" className={linkCls} activeProps={activeProps} onClick={() => setOpen(false)}>Login</Link>
          <Link to="/register" className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90" onClick={() => setOpen(false)}>Register</Link>
        </>
      )}
    </>
  );

  return (
    <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <Link to="/" className="font-display text-2xl font-semibold text-foreground">
          Saffron<span className="text-primary"> Table</span>
        </Link>
        <nav className="hidden items-center gap-6 md:flex">{links}</nav>
        <button className="md:hidden" aria-label="Toggle menu" onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button>
      </div>
      {open && <nav className="flex flex-col gap-4 border-t px-5 py-4 md:hidden">{links}</nav>}
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-20 bg-ink text-ink-foreground">
      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-12 md:grid-cols-3">
        <div>
          <p className="font-display text-xl">{RESTAURANT.name}</p>
          <p className="mt-2 text-sm opacity-75">{RESTAURANT.tagline}</p>
        </div>
        <div className="text-sm opacity-85">
          <p className="mb-2 font-semibold">Visit us</p>
          <p>{RESTAURANT.address}</p>
          <p>{RESTAURANT.hours}</p>
        </div>
        <div className="text-sm opacity-85">
          <p className="mb-2 font-semibold">Contact</p>
          <p>{RESTAURANT.phone}</p>
          <p>{RESTAURANT.email}</p>
        </div>
      </div>
      <p className="border-t border-ink-foreground/15 py-4 text-center text-xs opacity-60">© {new Date().getFullYear()} {RESTAURANT.name}. College project.</p>
    </footer>
  );
}

export function PageTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-8">
      <h1 className="text-4xl font-semibold">{title}</h1>
      {subtitle && <p className="mt-2 text-muted-foreground">{subtitle}</p>}
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const cls =
    status === "confirmed" ? "bg-success/15 text-success" :
    status === "cancelled" ? "bg-destructive/10 text-destructive" :
    "bg-warning/20 text-foreground";
  return <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${cls}`}>{status}</span>;
}
