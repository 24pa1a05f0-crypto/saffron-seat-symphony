import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useAuth } from "@/lib/auth";

/** Shows children only to signed-in users (and admins when adminOnly). Data is also protected in the database. */
export function RequireAuth({ children, adminOnly }: { children: ReactNode; adminOnly?: boolean }) {
  const { user, isAdmin, loading } = useAuth();
  if (loading) return <p className="py-24 text-center text-muted-foreground">Loading…</p>;
  if (!user)
    return (
      <div className="mx-auto max-w-md py-24 text-center">
        <h1 className="text-2xl font-semibold">Please log in</h1>
        <p className="mt-2 text-muted-foreground">You need an account to continue.</p>
        <Link to="/login" className="mt-6 inline-flex rounded-md bg-primary px-5 py-2 font-medium text-primary-foreground">Log in</Link>
      </div>
    );
  if (adminOnly && !isAdmin)
    return <p className="py-24 text-center text-muted-foreground">This page is for restaurant staff only.</p>;
  return <>{children}</>;
}
