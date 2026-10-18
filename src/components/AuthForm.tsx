import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/lib/auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const emailSchema = z.string().trim().email("Enter a valid email address").max(255);
const passwordSchema = z.string().min(8, "Password must be at least 8 characters").max(72);
const nameSchema = z.string().trim().min(2, "Name must be at least 2 characters").max(100);

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => { if (user) navigate({ to: "/bookings" }); }, [user, navigate]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null); setSuccess(null);
    const checks = [emailSchema.safeParse(email), passwordSchema.safeParse(password)];
    if (mode === "register") checks.unshift(nameSchema.safeParse(name));
    const failed = checks.find((c) => !c.success);
    if (failed && !failed.success) { setError(failed.error.issues[0].message); return; }

    setBusy(true);
    if (mode === "register") {
      const { error } = await supabase.auth.signUp({
        email: email.trim(), password,
        options: { emailRedirectTo: window.location.origin, data: { full_name: name.trim() } },
      });
      if (error) setError(error.message);
      else setSuccess("Account created! Check your email and click the confirmation link, then log in.");
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error) setError(error.message === "Invalid login credentials" ? "Incorrect email or password." : error.message);
    }
    setBusy(false);
  };

  const google = async () => {
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (result.error) setError("Google sign-in failed. Please try again.");
  };

  return (
    <div className="mx-auto max-w-md px-5 py-16">
      <div className="rounded-lg border bg-card p-8 shadow-sm">
        <h1 className="text-3xl font-semibold">{mode === "login" ? "Welcome back" : "Create an account"}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{mode === "login" ? "Log in to manage your bookings." : "Register to reserve a table."}</p>
        <form onSubmit={submit} className="mt-6 space-y-4" noValidate>
          {mode === "register" && (
            <div><Label htmlFor="name">Name</Label><Input id="name" value={name} onChange={(e) => setName(e.target.value)} maxLength={100} required /></div>
          )}
          <div><Label htmlFor="email">Email</Label><Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={255} required /></div>
          <div><Label htmlFor="password">Password</Label><Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} maxLength={72} required /></div>
          {error && <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
          {success && <p className="rounded-md bg-success/15 p-3 text-sm text-success">{success}</p>}
          <Button type="submit" className="w-full" disabled={busy}>{busy ? "Please wait…" : mode === "login" ? "Log in" : "Register"}</Button>
        </form>
        <div className="my-4 text-center text-xs text-muted-foreground">or</div>
        <Button variant="outline" className="w-full" onClick={google}>Continue with Google</Button>
        <p className="mt-6 text-center text-sm">
          {mode === "login" ? <>New here? <Link to="/register" className="font-semibold text-primary">Register</Link></> : <>Already registered? <Link to="/login" className="font-semibold text-primary">Log in</Link></>}
        </p>
      </div>
    </div>
  );
}
